export type ProjectStatus = "active" | "shipped" | "paused" | "archived";

export type Project = {
  slug: string;
  name: string;
  fullName: string;
  summary: string;
  status: ProjectStatus;
  tags: string[];
  repo: string;
  repoUrl: string;
  homepageUrl?: string;
  readmeUrl?: string;
  readmeMarkdown: string;
  readmeHtml: string;
  language?: string;
  stars: number;
  forks: number;
  year: number;
  createdAt: string | null;
  updatedAt: string | null;
  pushedAt: string | null;
};

export type ProjectsPayload = {
  owner: string;
  source: "github" | "fallback";
  updatedAt: string | null;
  projects: Project[];
};

export const projectsPayloadFallback: ProjectsPayload = {
  owner: "yule-studio",
  source: "fallback",
  updatedAt: null,
  projects: [],
};

const statuses = new Set<ProjectStatus>(["active", "shipped", "paused", "archived"]);

export function normalizeProjectsPayload(value: unknown): ProjectsPayload {
  if (!isRecord(value)) return projectsPayloadFallback;

  const projects = Array.isArray(value.projects)
    ? value.projects.map(normalizeProject).filter((project): project is Project => Boolean(project))
    : [];

  return {
    owner: readString(value.owner, projectsPayloadFallback.owner),
    source: value.source === "github" ? "github" : "fallback",
    updatedAt: readNullableString(value.updatedAt),
    projects,
  };
}

function normalizeProject(value: unknown): Project | null {
  if (!isRecord(value)) return null;

  const name = readString(value.name);
  const slug = readString(value.slug, slugify(name));
  const repoUrl = readString(value.repoUrl, readString(value.repo));

  if (!name || !slug || !repoUrl) return null;

  const status = statuses.has(value.status as ProjectStatus)
    ? (value.status as ProjectStatus)
    : "active";

  return {
    slug,
    name,
    fullName: readString(value.fullName, name),
    summary: readString(value.summary),
    status,
    tags: Array.isArray(value.tags)
      ? value.tags.map((tag) => readString(tag)).filter(Boolean).slice(0, 8)
      : [],
    repo: repoUrl,
    repoUrl,
    homepageUrl: readOptionalString(value.homepageUrl),
    readmeUrl: readOptionalString(value.readmeUrl),
    readmeMarkdown: readString(value.readmeMarkdown),
    readmeHtml: readString(value.readmeHtml),
    language: readOptionalString(value.language),
    stars: readNumber(value.stars),
    forks: readNumber(value.forks),
    year: readNumber(value.year, new Date().getFullYear()),
    createdAt: readNullableString(value.createdAt),
    updatedAt: readNullableString(value.updatedAt),
    pushedAt: readNullableString(value.pushedAt),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function readOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function readNullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function readNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
