export type GithubStats = {
  username: string;
  stars: number;
  prs: number;
  issues: number;
  repos: number;
  commits: number;
  contributedTo: number;
  updatedAt: string | null;
};

type GithubStatMetric = Exclude<keyof GithubStats, "username" | "updatedAt">;

export const githubStatsFallback: GithubStats = {
  username: "codwithyc",
  stars: 0,
  prs: 0,
  issues: 0,
  repos: 0,
  commits: 0,
  contributedTo: 0,
  updatedAt: null,
};

export const githubStatItems = [
  { key: "stars", label: "stars" },
  { key: "prs", label: "prs" },
  { key: "issues", label: "issues" },
  { key: "repos", label: "repos" },
  { key: "commits", label: "commits" },
  { key: "contributedTo", label: "contrib to" },
] as const satisfies ReadonlyArray<{ key: GithubStatMetric; label: string }>;
