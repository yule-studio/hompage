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

for (const repo of dedupedRepos) {
  if (!Array.isArray(repo.topics)) continue;
  for (const topic of repo.topics) {
    const entry = TOPIC_INDEX.get(topic);
    if (!entry) continue;
    const bucket = groups[entry.category];
    if (!bucket.has(entry.label)) {
      bucket.set(entry.label, { topic, label: entry.label, repos: new Set() });
    }
    bucket.get(entry.label).repos.add(repo.full_name);
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
  `(${dedupedRepos.length} repos scanned) to ${outputPath}`,
);
