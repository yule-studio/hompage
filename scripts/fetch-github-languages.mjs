import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const username = process.env.GITHUB_LANGUAGES_USERNAME?.trim() || "codwithyc";
const outputPath = resolve(process.env.GITHUB_LANGUAGES_OUTPUT ?? "public/github-languages.json");
const includeArchived = process.env.GITHUB_LANGUAGES_INCLUDE_ARCHIVED === "true";
const includeForks = process.env.GITHUB_LANGUAGES_INCLUDE_FORKS === "true";
const excludeRepos = new Set(splitList(process.env.GITHUB_LANGUAGES_EXCLUDE));
const minPercent = Number.parseFloat(process.env.GITHUB_LANGUAGES_MIN_PERCENT ?? "0.5");
const maxLanguages = Number.parseInt(process.env.GITHUB_LANGUAGES_MAX ?? "20", 10);
const token = [
  process.env.GITHUB_LANGUAGES_TOKEN,
  process.env.GITHUB_TOKEN,
  process.env.GH_STATS_TOKEN,
  process.env.GH_TOKEN,
].find(Boolean);

if (!token) {
  console.error("Missing GitHub token. Set GH_STATS_TOKEN, GH_TOKEN, or GITHUB_TOKEN.");
  process.exit(1);
}

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
    if (!Array.isArray(data)) {
      throw new Error(`Expected array from ${path}`);
    }
    items.push(...data);
    if (!link?.includes('rel="next"')) break;
    page += 1;
  }

  return items;
}

function splitList(value) {
  return value
    ? value.split(",").map((item) => item.trim()).filter(Boolean)
    : [];
}

/**
 * Color map for common languages. Mirrors GitHub's linguist colors for the
 * languages most likely to show up in this user's repos. Unknown languages
 * fall back to var(--text-muted) at render time.
 */
const COLORS = {
  Python: "#3572A5",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Dart: "#00B4AB",
  Lua: "#000080",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Scala: "#c22d40",
  R: "#198CE7",
  Solidity: "#AA6746",
  Dockerfile: "#384d54",
  HCL: "#844FBA",
  Terraform: "#5C4EE5",
  Makefile: "#427819",
  TeX: "#3D6117",
};

function filterRepos(repos) {
  return repos.filter((repo) => {
    if (repo.private) return false;
    if (repo.disabled) return false;
    if (!includeForks && repo.fork) return false;
    if (!includeArchived && repo.archived) return false;
    if (excludeRepos.has(repo.name)) return false;
    return true;
  });
}

const ownedRepos = filterRepos(await restPages(`/users/${username}/repos?type=owner&sort=pushed`));

const byteByLanguage = new Map();
const reposByLanguage = new Map();
let totalBytes = 0;
let processed = 0;

for (const repo of ownedRepos) {
  try {
    const { data } = await rest(`/repos/${repo.full_name}/languages`);
    for (const [language, bytes] of Object.entries(data)) {
      if (typeof bytes !== "number" || bytes <= 0) continue;
      byteByLanguage.set(language, (byteByLanguage.get(language) ?? 0) + bytes);
      reposByLanguage.set(language, (reposByLanguage.get(language) ?? new Set()).add(repo.name));
      totalBytes += bytes;
    }
    processed += 1;
  } catch (error) {
    console.warn(`Skipping ${repo.full_name}: ${error.message}`);
  }
}

let languages = [...byteByLanguage.entries()]
  .map(([name, bytes]) => ({
    name,
    bytes,
    percent: totalBytes > 0 ? Number(((bytes / totalBytes) * 100).toFixed(2)) : 0,
    repos: reposByLanguage.get(name)?.size ?? 0,
    color: COLORS[name] ?? null,
  }))
  .filter((lang) => lang.percent >= minPercent)
  .sort((a, b) => b.bytes - a.bytes);

if (Number.isFinite(maxLanguages)) {
  languages = languages.slice(0, maxLanguages);
}

const payload = {
  username,
  totalBytes,
  reposScanned: processed,
  languages,
  updatedAt: new Date().toISOString(),
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(
  `Wrote ${languages.length} languages (${processed} repos, ${totalBytes.toLocaleString()} bytes) ` +
  `for @${username} to ${outputPath}`,
);
