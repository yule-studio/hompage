import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

/**
 * Aggregates `repo.topics` across one or more sources (user / org).
 * Maps each known topic to a Skills category (Backend / DevOps / AI · Agents)
 * and counts how many repos use each topic. The hompage Skills page renders
 * these category groups instead of self-rated levels.
 *
 * Sources: GITHUB_TOPICS_SOURCES=user:codwithyc,org:yule-studio (defaults match).
 */
const sourcesRaw = process.env.GITHUB_TOPICS_SOURCES?.trim() || "user:codwithyc,org:yule-studio";
const outputPath = resolve(process.env.GITHUB_TOPICS_OUTPUT ?? "public/github-topics.json");
const includeArchived = process.env.GITHUB_TOPICS_INCLUDE_ARCHIVED === "true";
const includeForks = process.env.GITHUB_TOPICS_INCLUDE_FORKS === "true";
const minRepos = Number.parseInt(process.env.GITHUB_TOPICS_MIN_REPOS ?? "1", 10);
const token = [
  process.env.GITHUB_TOPICS_TOKEN,
  process.env.GITHUB_TOKEN,
  process.env.GH_STATS_TOKEN,
  process.env.GH_TOKEN,
].find(Boolean);

if (!token) {
  console.error("Missing GitHub token. Set GH_STATS_TOKEN, GH_TOKEN, or GITHUB_TOKEN.");
  process.exit(1);
}

const sources = sourcesRaw.split(",").map((entry) => {
  const [type, name] = entry.split(":").map((part) => part.trim());
  if (!type || !name) throw new Error(`Invalid source entry: ${entry}`);
  if (type !== "user" && type !== "org") throw new Error(`Source type must be user/org, got: ${type}`);
  return { type, name };
});

const apiHeaders = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "yule-studio-hompage",
};

async function rest(path) {
  const url = path.startsWith("http") ? path : `https://api.github.com${path}`;
  const response = await fetch(url, { headers: apiHeaders });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub REST ${response.status} for ${url}: ${body}`);
  }
  return {
    data: await response.json(),
    link: response.headers.get("link"),
  };
}

async function restPages(path) {
  const items = [];
  let page = 1;
  while (true) {
    const separator = path.includes("?") ? "&" : "?";
    const { data, link } = await rest(`${path}${separator}per_page=100&page=${page}`);
    if (!Array.isArray(data)) throw new Error(`Expected array from ${path}`);
    items.push(...data);
    if (!link?.includes('rel="next"')) break;
    page += 1;
  }
  return items;
}

function reposPath(source) {
  return source.type === "user"
    ? `/users/${source.name}/repos?type=owner&sort=pushed`
    : `/orgs/${source.name}/repos?type=public&sort=pushed`;
}

/**
 * Topic → Skills category mapping. Both the GitHub topic slug and a human
 * label are stored so the UI can show "FastAPI" rather than "fastapi".
 *
 * Add entries here as new topics start showing up on this user's repos.
 */
const CATEGORIES = {
  Backend: [
    ["fastapi", "FastAPI"],
    ["spring-boot", "Spring Boot"],
    ["spring", "Spring"],
    ["django", "Django"],
    ["flask", "Flask"],
    ["express", "Express"],
    ["nestjs", "NestJS"],
    ["nodejs", "Node.js"],
    ["postgresql", "PostgreSQL"],
    ["postgres", "PostgreSQL"],
    ["mysql", "MySQL"],
    ["redis", "Redis"],
    ["kafka", "Kafka"],
    ["rabbitmq", "RabbitMQ"],
    ["graphql", "GraphQL"],
    ["rest-api", "REST API"],
    ["mongodb", "MongoDB"],
    ["elasticsearch", "Elasticsearch"],
    ["sqlalchemy", "SQLAlchemy"],
    ["pydantic", "Pydantic"],
    ["asyncio", "asyncio"],
    ["sqlite", "SQLite"],
    ["discord-py", "discord.py"],
    ["caldav", "CalDAV"],
    ["icalendar", "iCalendar"],
  ],
  DevOps: [
    ["docker", "Docker"],
    ["kubernetes", "Kubernetes"],
    ["k8s", "Kubernetes"],
    ["k3s", "k3s"],
    ["terraform", "Terraform"],
    ["ansible", "Ansible"],
    ["helm", "Helm"],
    ["istio", "Istio"],
    ["github-actions", "GitHub Actions"],
    ["ci-cd", "CI / CD"],
    ["prometheus", "Prometheus"],
    ["grafana", "Grafana"],
    ["loki", "Loki"],
    ["nginx", "Nginx"],
    ["traefik", "Traefik"],
    ["argocd", "Argo CD"],
    ["self-hosted", "Self-hosted"],
    ["homelab", "Homelab"],
    ["proxmox", "Proxmox"],
    ["linux", "Linux"],
  ],
  "AI · Agents": [
    ["llm", "LLM"],
    ["openai", "OpenAI"],
    ["anthropic", "Anthropic"],
    ["claude", "Claude"],
    ["gpt", "GPT"],
    ["langchain", "LangChain"],
    ["llamaindex", "LlamaIndex"],
    ["rag", "RAG"],
    ["vector-db", "Vector DB"],
    ["embedding", "Embeddings"],
    ["agent", "Agent"],
    ["agents", "Agents"],
    ["ai-agent", "AI Agent"],
    ["llm-agent", "LLM Agent"],
    ["prompt-engineering", "Prompt Eng"],
    ["mcp", "MCP"],
    ["tool-calling", "Tool Calling"],
    ["coding-agent", "Coding Agent"],
    ["claude-code", "Claude Code"],
    ["gpt-cli", "GPT CLI"],
    ["self-host-ai", "Self-host AI"],
    ["obsidian", "Obsidian"],
  ],
};

// Build reverse index: topic slug → { category, label }
const TOPIC_INDEX = new Map();
for (const [category, entries] of Object.entries(CATEGORIES)) {
  for (const [slug, label] of entries) {
    if (!TOPIC_INDEX.has(slug)) {
      TOPIC_INDEX.set(slug, { category, label });
    }
  }
}

/**
 * Manifest scanning — extracts skill signals from common dependency / config
 * files when a repo doesn't have explicit GitHub topics. Each manifest gets a
 * regex per topic slug. The match is content-only (file existence alone is not
 * a signal, except for Dockerfile FROM lines).
 */
const MANIFEST_FILES = [
  "requirements.txt",
  "pyproject.toml",
  "package.json",
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
  "go.mod",
  "Cargo.toml",
  "Dockerfile",
  "docker-compose.yml",
  "docker-compose.yaml",
];

/**
 * Topic slug → regex (case-insensitive). When the regex matches any of the
 * fetched manifest contents, we register that topic for the repo as if it
 * had been explicitly tagged. Same slug is used as TOPIC_INDEX key so the
 * existing aggregation flow handles labelling.
 */
const MANIFEST_PATTERNS = [
  // Backend
  ["fastapi",        /\bfastapi\b/i],
  ["spring-boot",    /spring-boot-starter|org\.springframework\.boot/i],
  ["spring",         /org\.springframework\b/i],
  ["django",         /^django(?![\w-])|^django==|"django"/im],
  ["flask",          /^flask(?![\w-])|^flask==|"flask"/im],
  ["express",        /"express"\s*:/i],
  ["nestjs",         /@nestjs\//i],
  ["nodejs",         /"node"\s*:\s*"[\^~>=]/i],
  ["postgresql",     /\b(psycopg2|psycopg|asyncpg|pg|postgres(?:ql)?)\b/i],
  ["mysql",          /\b(pymysql|mysql-connector|mysqlclient|"mysql2"|"mysql")\b/i],
  ["redis",          /\bredis\b/i],
  ["kafka",          /\bkafka(?:-python|js)?\b/i],
  ["rabbitmq",       /\b(pika|amqplib|rabbitmq)\b/i],
  ["graphql",        /\bgraphql\b/i],
  ["mongodb",        /\b(pymongo|mongoose|mongodb)\b/i],
  ["elasticsearch",  /\belasticsearch\b/i],
  ["sqlalchemy",     /\bsqlalchemy\b/i],
  ["pydantic",       /\bpydantic\b/i],
  ["asyncio",        /\basyncio\b/i],
  ["sqlite",         /\b(sqlite3?|aiosqlite)\b|\.db['"]/i],
  ["discord-py",     /\b(discord\.py|discord_py|"discord\.py")\b|^import\s+discord|^from\s+discord\b/im],
  ["caldav",         /\bcaldav\b/i],
  ["icalendar",      /\bicalendar\b/i],
  // DevOps
  ["docker",         /^FROM\s+|^docker(?:file)?$/im],
  ["kubernetes",     /\bkubernetes\b|apiVersion:\s*apps\/v1/i],
  ["k3s",            /\bk3s\b/i],
  ["terraform",      /\b(terraform|hashicorp\/)/i],
  ["ansible",        /\bansible\b/i],
  ["helm",           /\bhelm\b/i],
  ["prometheus",     /\bprometheus(?:-client)?\b/i],
  ["grafana",        /\bgrafana\b/i],
  ["nginx",          /\bnginx\b/i],
  ["traefik",        /\btraefik\b/i],
  // AI / Agents
  ["openai",         /\bopenai\b/i],
  ["anthropic",      /\banthropic\b/i],
  ["langchain",      /\blangchain\b/i],
  ["llamaindex",     /\bllama[-_]?index\b/i],
  ["mcp",            /\bmcp(?:-server|-client)?\b|"@modelcontextprotocol\//i],
  ["claude-code",    /\bclaude[-_\s]?code\b/i],
  ["obsidian",       /\bobsidian\b/i],
];

async function fetchManifestTopics(repo) {
  const matched = new Set();
  for (const file of MANIFEST_FILES) {
    try {
      const { data } = await rest(`/repos/${repo.full_name}/contents/${file}`);
      if (!data || typeof data !== "object" || !data.content) continue;
      const content = Buffer.from(data.content.replace(/\s/g, ""), "base64").toString("utf8");
      for (const [slug, pattern] of MANIFEST_PATTERNS) {
        if (matched.has(slug)) continue;
        if (pattern.test(content)) {
          matched.add(slug);
        }
      }
    } catch (error) {
      // 404 = file doesn't exist for this repo — common, ignore.
      if (!String(error.message).includes("404")) {
        console.warn(`  ${repo.full_name} ${file}: ${error.message}`);
      }
    }
  }
  return matched;
}

/**
 * README scan — most repos describe their stack in README. Cheap signal
 * (1 API call per repo) that catches frameworks not pinned in manifests
 * (e.g. `discord.py` agent that imports Anthropic SDK at runtime but only
 * lists `discord.py` in pyproject.toml).
 */
async function fetchReadmeTopics(repo) {
  const matched = new Set();
  try {
    const { data } = await rest(`/repos/${repo.full_name}/readme`);
    if (!data || typeof data !== "object" || !data.content) return matched;
    const content = Buffer.from(data.content.replace(/\s/g, ""), "base64").toString("utf8");
    for (const [slug, pattern] of MANIFEST_PATTERNS) {
      if (pattern.test(content)) {
        matched.add(slug);
      }
    }
  } catch (error) {
    if (!String(error.message).includes("404")) {
      console.warn(`  ${repo.full_name} README: ${error.message}`);
    }
  }
  return matched;
}

function shouldKeepRepo(repo) {
  if (repo.private) return false;
  if (repo.disabled) return false;
  if (!includeForks && repo.fork) return false;
  if (!includeArchived && repo.archived) return false;
  return true;
}

const allRepos = [];
const failedSources = [];
for (const source of sources) {
  try {
    const repos = await restPages(reposPath(source));
    allRepos.push(...repos.filter(shouldKeepRepo));
    console.log(`  ${source.type}:${source.name} → ${repos.length} repos`);
  } catch (error) {
    console.warn(`  ${source.type}:${source.name} failed: ${error.message}`);
    failedSources.push(`${source.type}:${source.name}`);
  }
}

if (allRepos.length === 0 && failedSources.length > 0) {
  console.error(`All sources failed: ${failedSources.join(", ")}`);
  process.exit(1);
}

const seen = new Set();
const dedupedRepos = allRepos.filter((repo) => {
  if (seen.has(repo.full_name)) return false;
  seen.add(repo.full_name);
  return true;
});

// Aggregate per-category counts.
const groups = Object.fromEntries(
  Object.keys(CATEGORIES).map((cat) => [cat, new Map()]),
);

function registerTopic(slug, repoFullName) {
  const entry = TOPIC_INDEX.get(slug);
  if (!entry) return;
  const bucket = groups[entry.category];
  if (!bucket.has(entry.label)) {
    bucket.set(entry.label, { topic: slug, label: entry.label, repos: new Set() });
  }
  bucket.get(entry.label).repos.add(repoFullName);
}

let manifestHits = 0;
let readmeHits = 0;
for (const repo of dedupedRepos) {
  // 1) Explicit GitHub topics (preferred — repo owner's intent).
  const declared = Array.isArray(repo.topics) ? repo.topics : [];
  for (const topic of declared) {
    registerTopic(topic, repo.full_name);
  }

  // 2) Manifest fallback — declared dependencies.
  const fromManifests = await fetchManifestTopics(repo);
  for (const slug of fromManifests) {
    if (declared.includes(slug)) continue;
    registerTopic(slug, repo.full_name);
    manifestHits += 1;
  }

  // 3) README fallback — frameworks mentioned in prose / fenced code.
  //    Catches runtime libs that aren't pinned in manifests.
  const fromReadme = await fetchReadmeTopics(repo);
  for (const slug of fromReadme) {
    if (declared.includes(slug) || fromManifests.has(slug)) continue;
    registerTopic(slug, repo.full_name);
    readmeHits += 1;
  }
}

const categories = Object.entries(groups).map(([name, bucket]) => {
  const items = [...bucket.values()]
    .map((it) => ({ topic: it.topic, label: it.label, repos: it.repos.size }))
    .filter((it) => it.repos >= minRepos)
    .sort((a, b) => b.repos - a.repos || a.label.localeCompare(b.label));
  return { name, items };
});

const payload = {
  sources: sources.map((s) => `${s.type}:${s.name}`),
  reposScanned: dedupedRepos.length,
  reposWithTopics: dedupedRepos.filter((r) => Array.isArray(r.topics) && r.topics.length).length,
  categories,
  updatedAt: new Date().toISOString(),
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);
console.log(
  `Wrote ${totalItems} topics across ${categories.length} categories ` +
  `(${dedupedRepos.length} repos scanned, ${manifestHits} manifest + ${readmeHits} README hits) ` +
  `to ${outputPath}`,
);
