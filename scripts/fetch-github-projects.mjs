import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

/**
 * Sources: comma-separated `type:name` entries (e.g. `user:codwithyc,org:yule-studio`).
 * Falls back to legacy single-owner env vars when GITHUB_PROJECTS_SOURCES is unset.
 */
const sourcesRaw = process.env.GITHUB_PROJECTS_SOURCES?.trim();
const legacyOwner = process.env.GITHUB_PROJECTS_OWNER?.trim() || "yule-studio";
const legacyOwnerType = process.env.GITHUB_PROJECTS_OWNER_TYPE?.trim() || "org";
const sources = sourcesRaw
  ? sourcesRaw.split(",").map((entry) => {
      const [type, name] = entry.split(":").map((part) => part.trim());
      if (!type || !name) throw new Error(`Invalid source entry: ${entry}`);
      if (type !== "user" && type !== "org") throw new Error(`Source type must be user/org, got: ${type}`);
      return { type, name };
    })
  : [{ type: legacyOwnerType === "user" ? "user" : "org", name: legacyOwner }];
const outputPath = resolve(process.env.GITHUB_PROJECTS_OUTPUT ?? "public/projects.json");
const includeRepos = splitList(process.env.GITHUB_PROJECTS_INCLUDE);
const excludeRepos = new Set(splitList(process.env.GITHUB_PROJECTS_EXCLUDE));
const topicFilter = process.env.GITHUB_PROJECTS_TOPIC?.trim();
const includeArchived = process.env.GITHUB_PROJECTS_INCLUDE_ARCHIVED === "true";
const includeForks = process.env.GITHUB_PROJECTS_INCLUDE_FORKS === "true";
const maxProjects = Number.parseInt(process.env.GITHUB_PROJECTS_MAX ?? "24", 10);
/**
 * Token priority — prefer the workflow-scoped GITHUB_TOKEN over user PATs.
 * yule-studio org has a fine-grained PAT lifetime ≤366d policy, so a
 * long-lived GH_STATS_TOKEN gets 403 on org endpoints. The default
 * GITHUB_TOKEN from GH Actions is scoped to the repo / workflow and works.
 * Falls through to a PAT only when GITHUB_TOKEN isn't present (local runs).
 */
const token = [
  process.env.GITHUB_PROJECTS_TOKEN,
  process.env.GITHUB_TOKEN,
  process.env.GH_STATS_TOKEN,
  process.env.GH_TOKEN,
].find(Boolean);

const apiHeaders = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "yule-studio-hompage",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function rest(path, init = {}) {
  const url = path.startsWith("http") ? path : `https://api.github.com${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      ...apiHeaders,
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub REST ${response.status} for ${url}: ${body}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  return {
    data,
    link: response.headers.get("link"),
  };
}

async function restPages(path) {
  const items = [];
  let page = 1;

  while (true) {
    const separator = path.includes("?") ? "&" : "?";
    const { data, link } = await rest(`${path}${separator}per_page=100&page=${page}`);

    if (!Array.isArray(data)) {
      throw new Error(`Expected an array response from ${path}.`);
    }

    items.push(...data);

    if (!link?.includes('rel="next"')) break;
    page += 1;
  }

  return items;
}

async function fetchReadme(repo) {
  try {
    const { data } = await rest(`/repos/${repo.full_name}/readme`);
    const markdown = decodeBase64(data.content ?? "");
    const html = markdown ? rewriteReadmeUrls(await renderMarkdown(markdown, repo.full_name), repo) : "";

    return {
      readmeMarkdown: markdown,
      readmeHtml: html,
      readmeUrl: data.html_url ?? `${repo.html_url}#readme`,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("GitHub REST 404")) {
      return {
        readmeMarkdown: "",
        readmeHtml: "<p>README가 아직 없습니다.</p>",
        readmeUrl: `${repo.html_url}#readme`,
      };
    }
    throw error;
  }
}

async function renderMarkdown(markdown, context) {
  const { data } = await rest("/markdown", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: markdown,
      mode: "gfm",
      context,
    }),
  });

  return typeof data === "string" ? data : "";
}

function toProject(repo, readme) {
  const tags = [
    ...(repo.language ? [repo.language] : []),
    ...(Array.isArray(repo.topics) ? repo.topics : []),
  ]
    .map((tag) => String(tag).trim())
    .filter(Boolean);

  const uniqueTags = Array.from(new Set(tags)).slice(0, 8);
  const homepageUrl = typeof repo.homepage === "string" && repo.homepage.trim()
    ? repo.homepage.trim()
    : undefined;

  return {
    slug: repo.name,
    name: repo.name,
    fullName: repo.full_name,
    summary: repo.description ?? "",
    status: repo.archived ? "archived" : homepageUrl ? "shipped" : "active",
    tags: uniqueTags,
    repo: repo.html_url,
    repoUrl: repo.html_url,
    homepageUrl,
    readmeUrl: readme.readmeUrl,
    readmeMarkdown: readme.readmeMarkdown,
    readmeHtml: readme.readmeHtml,
    language: repo.language ?? undefined,
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    year: getYear(repo.created_at ?? repo.pushed_at ?? repo.updated_at),
    createdAt: repo.created_at ?? null,
    updatedAt: repo.updated_at ?? null,
    pushedAt: repo.pushed_at ?? null,
  };
}

function rewriteReadmeUrls(html, repo) {
  const rawBase = `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/`;
  const blobBase = `${repo.html_url}/blob/${repo.default_branch}/`;

  return html.replace(/\b(src|href)="([^"]+)"/g, (match, attr, url) => {
    if (isExternalUrl(url) || url.startsWith("#")) return match;

    const normalizedUrl = url.replace(/^\.?\//, "");
    const baseUrl = attr === "src" ? rawBase : blobBase;

    return `${attr}="${baseUrl}${normalizedUrl}"`;
  });
}

function isExternalUrl(value) {
  return /^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith("//");
}

function filterRepos(repos) {
  const included = includeRepos.length ? new Set(includeRepos) : null;
  const filtered = repos.filter((repo) => {
    if (!included && repo.name.startsWith(".")) return false;
    if (repo.private) return false;
    if (repo.disabled) return false;
    if (!includeForks && repo.fork) return false;
    if (!includeArchived && repo.archived) return false;
    if (excludeRepos.has(repo.name)) return false;
    if (included && !included.has(repo.name)) return false;
    if (topicFilter && !repo.topics?.includes(topicFilter)) return false;
    return true;
  });

  if (!included) {
    return filtered.slice(0, Number.isFinite(maxProjects) ? maxProjects : 24);
  }

  return filtered.sort((a, b) => includeRepos.indexOf(a.name) - includeRepos.indexOf(b.name));
}

function getReposPath(source) {
  if (source.type === "user") {
    return `/users/${source.name}/repos?type=owner&sort=pushed`;
  }
  return `/orgs/${source.name}/repos?type=public&sort=pushed`;
}

function splitList(value) {
  return value
    ? value.split(",").map((item) => item.trim()).filter(Boolean)
    : [];
}

function decodeBase64(value) {
  const normalized = value.replace(/\s/g, "");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function getYear(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().getFullYear() : date.getUTCFullYear();
}

const allRepos = [];
const failedSources = [];
for (const source of sources) {
  try {
    const repos = await restPages(getReposPath(source));
    for (const repo of repos) {
      repo.__source = source;
    }
    allRepos.push(...repos);
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

// Dedupe by full_name (user repo + org fork could collide; prefer first occurrence).
const seen = new Set();
const dedupedRepos = allRepos.filter((repo) => {
  if (seen.has(repo.full_name)) return false;
  seen.add(repo.full_name);
  return true;
});

const filteredRepos = filterRepos(dedupedRepos)
  .sort((a, b) => new Date(b.pushed_at ?? 0).getTime() - new Date(a.pushed_at ?? 0).getTime());

const projects = await Promise.all(
  filteredRepos.map(async (repo) => toProject(repo, await fetchReadme(repo))),
);

const payload = {
  sources: sources.map((s) => `${s.type}:${s.name}`),
  owner: sources[0]?.name ?? null,
  source: "github",
  updatedAt: new Date().toISOString(),
  projects,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(
  `Wrote ${projects.length} GitHub projects from ` +
  `${sources.map((s) => `${s.type}:${s.name}`).join(", ")} to ${outputPath}`,
);
