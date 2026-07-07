import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/Card/Card";
import Navigation from "../../components/Navigation/Navigation";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import ProfileCard from "../../components/ProfileCard/ProfileCard";
import HomeHero from "../../components/Hero/HomeHero";
import { profile } from "../../data/profile";
import { githubStatItems, githubStatsFallback, type GithubStats } from "../../data/githubStats";
import { useProjects } from "../../hooks/useProjects";
import { useGithubLanguages } from "../../hooks/useGithubLanguages";
import { useBlog } from "../../hooks/useBlog";
import { posts } from "../../data/posts";
import { hosts, services } from "../../data/homelab";
import { events } from "../../data/events";
import { skills } from "../../data/skills";
import { certs } from "../../data/certs";
import { awards } from "../../data/awards";

/**
 * Home — hero + uniform 3-col dashboard.
 *
 * Layout uses only 3 span sizes for a calm, even grid:
 *   - sm  = 4col × 3row  (single info card)
 *   - md  = 8col × 3row  (featured content)
 *   - xl  = 12col × 3row (full-width bottom card)
 *   - hero= 4col × 6row  (Profile photo card, anchors left column)
 *
 * Blog opens externally (Tistory).
 */
export default function Home() {
  const [githubStats, setGithubStats] = useState<GithubStats>(githubStatsFallback);
  const { projects } = useProjects();
  const { languages: topLanguages } = useGithubLanguages();
  const blog = useBlog();
  const featured = posts[0];
  const okHosts = hosts.filter((h) => h.status === "ok").length;
  const warnHosts = hosts.filter((h) => h.status === "warn").length;
  const errHosts = hosts.filter((h) => h.status === "err").length;
  const nextEvent = events[0];
  const lastAward = awards[0];
  const stackCount = skills.reduce((sum, g) => sum + g.items.length, 0);
  const selectedProjects = projects
    .filter((project) => project.status === "active" || project.status === "shipped")
    .slice(0, 2);

  useEffect(() => {
    let isMounted = true;

    fetch(`${import.meta.env.BASE_URL}github-stats.json`, { cache: "no-cache" })
      .then((response) => {
        if (!response.ok) throw new Error("GitHub stats unavailable");
        return response.json();
      })
      .then((data: unknown) => {
        if (isMounted) setGithubStats(normalizeGithubStats(data));
      })
      .catch(() => {
        if (isMounted) setGithubStats(githubStatsFallback);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="home-shell">
      {/* ── hero (portfolio intro + swinging nametag) ────── */}
      <HomeHero />

      <Navigation />

      {/* ── dashboard cards (uniform 3-col) ──────────────── */}
      <div className="grid">
        {/* row 1 col 1-4 : profile photo card */}
        <ProfileCard />

        {/* row 1-3 : GitHub + Awards */}
        <Card span="sm" hoverable ariaLabel="github" className="home-github-card">
          <div className="card-head">
            <span className="label">/ github</span>
            <StatusBadge status="ok" label="active" />
          </div>
          <h3 className="card-title">GitHub</h3>
          <div className="card-body">
            <div className="kpi-row github-kpi-row">
              {githubStatItems.map((item) => (
                <div className="kpi" key={item.key}>
                  <span className="kpi-value">{formatKpi(githubStats[item.key])}</span>
                  <span className="kpi-label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card-footer">
            <a className="card-link" href={profile.links.github} target="_blank" rel="noreferrer">view github</a>
            <span className="mono faint">@{githubStats.username}</span>
          </div>
        </Card>

        <Card span="sm" hoverable ariaLabel="awards" className="home-awards-card">
          <div className="card-head">
            <span className="label">/ awards</span>
          </div>
          <h3 className="card-title">{lastAward.title}</h3>
          <p className="card-meta">
            <span className="mono faint">{lastAward.year}</span>
            <span className="dim"> · most recent</span>
          </p>
          <div className="card-footer">
            <Link to="/awards" className="card-link">all awards</Link>
            <span className="mono faint">{awards.length} total</span>
          </div>
        </Card>

        {/* row 4-6 : Certifications + Projects */}
        <Card span="sm" hoverable ariaLabel="certifications">
          <div className="card-head">
            <span className="label">/ certs</span>
            <span className="mono faint">
              {certs.filter((c) => c.status === "active").length} active
            </span>
          </div>
          <h3 className="card-title">Certifications</h3>
          <div className="card-body">
            <ul className="card-list">
              {certs.slice(0, 3).map((c) => (
                <li key={c.name}>
                  <span>{c.name.split(" (")[0]}</span>
                  <span className="mono faint">'{String(c.year).slice(2)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-footer">
            <Link to="/certs" className="card-link">all certs</Link>
          </div>
        </Card>

        <Card span="sm" hoverable ariaLabel="projects">
          <div className="card-head">
            <span className="label">/ projects</span>
            <span className="mono faint">{projects.length} total</span>
          </div>
          <h3 className="card-title">Selected</h3>
          <div className="card-body">
            <ul className="card-list">
              {selectedProjects.length ? selectedProjects.map((p) => (
                <li key={p.slug}>
                  <Link to={`/projects/${p.slug}`} className="project-list-link">
                    <span>{p.name}</span>
                  </Link>
                  <span className="mono faint">{p.year}</span>
                </li>
              )) : (
                <li>
                  <span className="dim">아직 동기화된 프로젝트가 없어요.</span>
                </li>
              )}
            </ul>
          </div>
          <div className="card-footer">
            <Link to="/projects" className="card-link">all projects</Link>
          </div>
        </Card>

        {/* row 7-9 : Blog (top-viewed from Tistory) + Skills (sm) */}
        <Card span="md" hoverable ariaLabel="featured writing">
          <div className="card-head">
            <span className="label">/ blog</span>
            <span className="mono faint">latest</span>
          </div>
          {(() => {
            const post = blog.featured ?? {
              title: featured.title,
              link: profile.links.blog,
              description: featured.summary,
              date: featured.date,
              views: 0,
              readMin: featured.readMin,
            };
            return (
              <>
                <h3 className="card-title blog-featured-title">{post.title}</h3>
                <p className="card-sub blog-featured-desc">{post.description}</p>
                <div className="card-footer">
                  <a className="card-link" href={post.link} target="_blank" rel="noreferrer">
                    read on blog
                  </a>
                  <span className="mono faint">
                    {post.date ? `${post.date} · ` : ""}{post.readMin} min
                  </span>
                </div>
              </>
            );
          })()}
        </Card>

        <Card span="sm" hoverable ariaLabel="skills" className="home-stack-card">
          <div className="card-head">
            <span className="label">/ stack</span>
            <span className="mono faint">top langs</span>
          </div>
          <h3 className="card-title">Stack</h3>
          <div className="card-body">
            <div className="chip-row">
              {(topLanguages.length
                ? topLanguages.slice(0, 4)
                : skills[0].items.slice(0, 4).map((s) => ({
                    name: s.name.split(" /")[0].split(" (")[0],
                    percent: 0,
                    color: null as string | null,
                  }))
              ).map((lang) => (
                <span key={lang.name} className="chip lang-chip">
                  <span
                    className="lang-dot"
                    aria-hidden
                    style={{ background: lang.color ?? "var(--text-muted)" }}
                  />
                  {lang.name}
                </span>
              ))}
            </div>
          </div>
          <div className="card-footer">
            <Link to="/skills" className="card-link">view skills</Link>
            <span className="mono faint">
              {topLanguages.length || stackCount} {topLanguages.length ? "langs" : "items"}
            </span>
          </div>
        </Card>

        {/* row 10-12 : Homelab + Calendar + Services snapshot */}
        <Card span="sm" hoverable ariaLabel="homelab">
          <div className="card-head">
            <span className="label">/ homelab</span>
            <StatusBadge
              status={errHosts ? "err" : warnHosts ? "warn" : "ok"}
              label={`${okHosts}/${hosts.length} ok`}
            />
          </div>
          <h3 className="card-title">Homelab</h3>
          <div className="card-body">
            <ul className="card-list home-host-list">
              {hosts.slice(0, 3).map((h) => (
                <li key={h.name}>
                  <span className="host-name">
                    <span className={`host-dot host-dot--${h.status}`} aria-hidden />
                    {h.name}
                  </span>
                  <span className="mono faint">{h.cpu}c · {h.mem}g</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-footer">
            <Link to="/homelab" className="card-link">console</Link>
          </div>
        </Card>

        <Card span="sm" hoverable ariaLabel="calendar" className="home-calendar-card">
          <div className="card-head">
            <span className="label">/ calendar</span>
            <span className="mono faint">
              {nextEvent.date}{nextEvent.time ? ` · ${nextEvent.time}` : ""}
            </span>
          </div>
          <h3 className="card-title">{nextEvent.title}</h3>
          <p className="card-meta">
            <span className="dim">next up</span>
          </p>
          <div className="card-footer">
            <Link to="/calendar" className="card-link">open calendar</Link>
          </div>
        </Card>

        <Card span="sm" hoverable ariaLabel="services" className="home-services-card">
          <div className="card-head">
            <span className="label">/ services</span>
            <span className="mono faint">{services.length} live</span>
          </div>
          <h3 className="card-title">Services</h3>
          <div className="card-body">
            <ul className="card-list">
              {services.slice(0, 2).map((s) => (
                <li key={s.name}>
                  <span>{s.name}</span>
                  <StatusBadge status={s.status} label={s.status === "ok" ? "ok" : s.status} />
                </li>
              ))}
            </ul>
          </div>
          <div className="card-footer">
            <Link to="/homelab" className="card-link">view all</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

const numberFormatter = new Intl.NumberFormat("en-US");

function formatKpi(value: number) {
  if (value >= 1_000_000) return `${trimDecimal(value / 1_000_000)}m`;
  if (value >= 10_000) return `${trimDecimal(value / 1_000)}k`;
  return numberFormatter.format(value);
}

function trimDecimal(value: number) {
  return value.toFixed(1).replace(".0", "");
}

function normalizeGithubStats(value: unknown): GithubStats {
  if (!value || typeof value !== "object") return githubStatsFallback;

  const data = value as Partial<Record<keyof GithubStats, unknown>>;

  return {
    username: typeof data.username === "string" ? data.username : githubStatsFallback.username,
    stars: readStat(data.stars, githubStatsFallback.stars),
    prs: readStat(data.prs, githubStatsFallback.prs),
    issues: readStat(data.issues, githubStatsFallback.issues),
    repos: readStat(data.repos, githubStatsFallback.repos),
    commits: readStat(data.commits, githubStatsFallback.commits),
    contributedTo: readStat(data.contributedTo, githubStatsFallback.contributedTo),
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : null,
  };
}

function readStat(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.round(value)
    : fallback;
}
