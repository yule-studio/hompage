import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const username = process.env.GITHUB_STATS_USERNAME?.trim() || "codwithyc";
const token = [
  process.env.GH_STATS_TOKEN,
  process.env.GITHUB_STATS_TOKEN,
  process.env.GH_TOKEN,
  process.env.GITHUB_TOKEN,
].find(Boolean);
const outputPath = resolve(process.env.GITHUB_STATS_OUTPUT ?? "public/github-stats.json");
const includeAllCommits = process.env.GITHUB_STATS_INCLUDE_ALL_COMMITS !== "false";
const commitsYear = process.env.GITHUB_STATS_COMMITS_YEAR?.trim();

if (!token) {
  console.error("Missing GitHub token. Set GH_STATS_TOKEN, GITHUB_STATS_TOKEN, GH_TOKEN, or GITHUB_TOKEN.");
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

async function graphql(query, variables) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      ...apiHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const body = await response.json();

  if (!response.ok || body.errors?.length) {
    throw new Error(`GitHub GraphQL failed: ${JSON.stringify(body.errors ?? body)}`);
  }

  return body.data;
}

async function countCommitSearch(query) {
  const encoded = encodeURIComponent(query);
  const { data } = await rest(`/search/commits?q=${encoded}&per_page=1`);
  return data.total_count ?? 0;
}

async function getReadmeStats() {
  const data = await graphql(
    `query GitHubReadmeStats($login: String!, $startTime: DateTime) {
      user(login: $login) {
        contributionsCollection {
          totalCommitContributions
        }
        commitsSinceYear: contributionsCollection(from: $startTime) {
          totalCommitContributions
        }
        repositoriesContributedTo(
          first: 1
          contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]
        ) {
          totalCount
        }
        pullRequests(first: 1) {
          totalCount
        }
        openIssues: issues(states: OPEN) {
          totalCount
        }
        closedIssues: issues(states: CLOSED) {
          totalCount
        }
        repositories(
          first: 100
          ownerAffiliations: OWNER
          orderBy: { direction: DESC, field: STARGAZERS }
        ) {
          totalCount
          nodes {
            name
            stargazers {
              totalCount
            }
          }
        }
      }
    }`,
    {
      login: username,
      startTime: commitsYear ? `${commitsYear}-01-01T00:00:00Z` : null,
    },
  );

  if (!data.user) {
    throw new Error(`GitHub user not found: ${username}`);
  }

  return data.user;
}

const [readmeStats, allCommits] = await Promise.all([
  getReadmeStats(),
  includeAllCommits ? countCommitSearch(`author:${username}`) : Promise.resolve(null),
]);

const stars = readmeStats.repositories.nodes.reduce((sum, repo) => {
  return sum + (repo.stargazers.totalCount ?? 0);
}, 0);
const contributionCommits = commitsYear
  ? readmeStats.commitsSinceYear.totalCommitContributions
  : readmeStats.contributionsCollection.totalCommitContributions;

const stats = {
  username,
  stars,
  prs: readmeStats.pullRequests.totalCount,
  issues: readmeStats.openIssues.totalCount + readmeStats.closedIssues.totalCount,
  repos: readmeStats.repositories.totalCount,
  commits: allCommits ?? contributionCommits,
  contributedTo: readmeStats.repositoriesContributedTo.totalCount,
  updatedAt: new Date().toISOString(),
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(stats, null, 2)}\n`, "utf8");

console.log(`Wrote GitHub stats for @${username} to ${outputPath}`);
