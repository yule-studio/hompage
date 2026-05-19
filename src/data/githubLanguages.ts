export type GithubLanguage = {
  name: string;
  bytes: number;
  percent: number;
  repos: number;
  color: string | null;
};

export type GithubLanguagesPayload = {
  username: string;
  totalBytes: number;
  reposScanned: number;
  languages: GithubLanguage[];
  updatedAt: string | null;
};

export const githubLanguagesFallback: GithubLanguagesPayload = {
  username: "codwithyc",
  totalBytes: 0,
  reposScanned: 0,
  languages: [],
  updatedAt: null,
};

export function normalizeGithubLanguages(raw: unknown): GithubLanguagesPayload {
  if (!raw || typeof raw !== "object") return githubLanguagesFallback;
  const r = raw as Record<string, unknown>;
  const list = Array.isArray(r.languages) ? r.languages : [];

  const languages: GithubLanguage[] = list
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const it = item as Record<string, unknown>;
      const name = typeof it.name === "string" ? it.name : null;
      if (!name) return null;
      return {
        name,
        bytes: Number(it.bytes ?? 0),
        percent: Number(it.percent ?? 0),
        repos: Number(it.repos ?? 0),
        color: typeof it.color === "string" ? it.color : null,
      };
    })
    .filter((lang): lang is GithubLanguage => lang !== null);

  return {
    username: typeof r.username === "string" ? r.username : githubLanguagesFallback.username,
    totalBytes: Number(r.totalBytes ?? 0),
    reposScanned: Number(r.reposScanned ?? 0),
    languages,
    updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : null,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
