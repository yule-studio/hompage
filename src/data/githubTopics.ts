export type GithubTopicItem = {
  topic: string;
  label: string;
  repos: number;
};

export type GithubTopicCategory = {
  name: string;
  items: GithubTopicItem[];
};

export type GithubTopicsPayload = {
  sources: string[];
  reposScanned: number;
  reposWithTopics: number;
  categories: GithubTopicCategory[];
  updatedAt: string | null;
};

export const githubTopicsFallback: GithubTopicsPayload = {
  sources: [],
  reposScanned: 0,
  reposWithTopics: 0,
  categories: [],
  updatedAt: null,
};

export function normalizeGithubTopics(raw: unknown): GithubTopicsPayload {
  if (!raw || typeof raw !== "object") return githubTopicsFallback;
  const r = raw as Record<string, unknown>;

  const categories: GithubTopicCategory[] = Array.isArray(r.categories)
    ? r.categories
        .map((cat) => {
          if (!cat || typeof cat !== "object") return null;
          const c = cat as Record<string, unknown>;
          const name = typeof c.name === "string" ? c.name : null;
          if (!name) return null;
          const items = Array.isArray(c.items)
            ? c.items
                .map((item) => {
                  if (!item || typeof item !== "object") return null;
                  const it = item as Record<string, unknown>;
                  const label = typeof it.label === "string" ? it.label : null;
                  if (!label) return null;
                  return {
                    topic: typeof it.topic === "string" ? it.topic : label,
                    label,
                    repos: Number(it.repos ?? 0),
                  };
                })
                .filter((it): it is GithubTopicItem => it !== null)
            : [];
          return { name, items };
        })
        .filter((cat): cat is GithubTopicCategory => cat !== null)
    : [];

  return {
    sources: Array.isArray(r.sources) ? r.sources.filter((s): s is string => typeof s === "string") : [],
    reposScanned: Number(r.reposScanned ?? 0),
    reposWithTopics: Number(r.reposWithTopics ?? 0),
    categories,
    updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : null,
  };
}
