import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

/**
 * Tistory blog sync — RSS gives the post list. The featured post is the most
 * recent one (RSS publication order). Per-post view counts can't be scraped
 * reliably: the user's theme only exposes a sidebar-level total visitor
 * counter (#counter), not a per-post counter, and Tistory's owner-only
 * stats API was deprecated in 2021. If the user switches to a theme that
 * surfaces per-post views, the regex/selector here can be added back.
 */
const blogUrl = (process.env.BLOG_URL || "https://codingtips.tistory.com").replace(/\/$/, "");
const outputPath = resolve(process.env.BLOG_OUTPUT ?? "public/blog.json");
const maxPosts = Number.parseInt(process.env.BLOG_MAX_POSTS ?? "30", 10);
const fetchTimeoutMs = Number.parseInt(process.env.BLOG_TIMEOUT_MS ?? "10000", 10);

const userAgent = "yule-studio-hompage (+https://yule-studio.github.io/hompage)";

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), fetchTimeoutMs);
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": userAgent, Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripHtml(html) {
  // Decode entities FIRST so RSS-escaped <p>foo</p> becomes real tags to strip.
  return decodeEntities(decodeEntities(html))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(body, tag) {
  // CDATA-wrapped variant
  const cdata = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`).exec(body);
  if (cdata) return cdata[1].trim();
  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`).exec(body);
  return plain ? plain[1].trim() : "";
}

function parseRssItems(rss) {
  const blocks = [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  return blocks.map((m) => {
    const body = m[1];
    const link = extractTag(body, "link") || extractTag(body, "guid");
    const rawDescription = extractTag(body, "description");
    return {
      title: stripHtml(extractTag(body, "title")),
      link,
      description: stripHtml(rawDescription).slice(0, 220),
      pubDate: extractTag(body, "pubDate"),
    };
  });
}

function isoDate(pubDate) {
  if (!pubDate) return null;
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function extractReadMinutes(html) {
  // Tistory doesn't expose reading time; estimate from raw content length.
  const article = /<article[\s\S]*?<\/article>/i.exec(html) ?? [html];
  const text = stripHtml(article[0]);
  // ~400 wpm for Korean / ~250 for English; pick 350 as middle.
  return Math.max(1, Math.round(text.length / 700));
}

const rss = await fetchText(`${blogUrl}/rss`);
let posts = parseRssItems(rss).slice(0, maxPosts);

if (posts.length === 0) {
  console.error(`No posts in RSS at ${blogUrl}/rss`);
  process.exit(1);
}

// Estimate reading time per post — be polite (single fetch per post).
for (const post of posts) {
  try {
    const html = await fetchText(post.link);
    post.readMin = extractReadMinutes(html);
    post.views = 0; // per-post view count unavailable on current theme
    console.log(`  ${post.readMin}min · ${post.link}`);
  } catch (error) {
    post.readMin = 5;
    post.views = 0;
    console.warn(`  skip ${post.link}: ${error.message}`);
  }
}

// RSS items already arrive in newest-first order; the featured post is just
// the first item. Top posts == latest posts until per-post view scraping
// becomes possible.
const featured = posts[0] ?? null;

const payload = {
  blogUrl,
  totalPosts: posts.length,
  featured: featured ? { ...featured, date: isoDate(featured.pubDate) } : null,
  topPosts: posts.slice(0, 5).map((p) => ({ ...p, date: isoDate(p.pubDate) })),
  latestPosts: posts.slice(0, 5).map((p) => ({ ...p, date: isoDate(p.pubDate) })),
  updatedAt: new Date().toISOString(),
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(
  `Wrote ${posts.length} posts (featured: "${featured?.title}") to ${outputPath}`,
);
