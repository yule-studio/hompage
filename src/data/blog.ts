export type BlogPost = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  date: string | null;
  views: number;
  readMin: number;
};

export type BlogPayload = {
  blogUrl: string;
  totalPosts: number;
  featured: BlogPost | null;
  topPosts: BlogPost[];
  latestPosts: BlogPost[];
  updatedAt: string | null;
};

export const blogFallback: BlogPayload = {
  blogUrl: "https://codingtips.tistory.com",
  totalPosts: 0,
  featured: null,
  topPosts: [],
  latestPosts: [],
  updatedAt: null,
};

function normalizePost(raw: unknown): BlogPost | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const title = typeof r.title === "string" ? r.title : null;
  const link = typeof r.link === "string" ? r.link : null;
  if (!title || !link) return null;
  return {
    title,
    link,
    description: typeof r.description === "string" ? r.description : "",
    pubDate: typeof r.pubDate === "string" ? r.pubDate : "",
    date: typeof r.date === "string" ? r.date : null,
    views: Number(r.views ?? 0),
    readMin: Number(r.readMin ?? 5),
  };
}

export function normalizeBlog(raw: unknown): BlogPayload {
  if (!raw || typeof raw !== "object") return blogFallback;
  const r = raw as Record<string, unknown>;
  const arrayOf = (v: unknown): BlogPost[] =>
    Array.isArray(v) ? v.map(normalizePost).filter((p): p is BlogPost => p !== null) : [];
  return {
    blogUrl: typeof r.blogUrl === "string" ? r.blogUrl : blogFallback.blogUrl,
    totalPosts: Number(r.totalPosts ?? 0),
    featured: normalizePost(r.featured),
    topPosts: arrayOf(r.topPosts),
    latestPosts: arrayOf(r.latestPosts),
    updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : null,
  };
}
