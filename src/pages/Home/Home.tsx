import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/Card/Card";
import Navigation from "../../components/Navigation/Navigation";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import ProfileCard from "../../components/ProfileCard/ProfileCard";
import { profile } from "../../data/profile";
import { githubStatItems, githubStatsFallback, type GithubStats } from "../../data/githubStats";
import { useProjects } from "../../hooks/useProjects";
import { useGithubLanguages } from "../../hooks/useGithubLanguages";
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
      {/* ── hero ─────────────────────────────────────────── */}
      <section className="hero" aria-label="profile">
        <h1>{profile.name}</h1>
        <div className="hero-row">
          <span>{profile.role}</span>
          <span className="dot" aria-hidden />
          <span className="hero-loc">{profile.location}</span>
        </div>

        <div className="hero-ctas" aria-label="contact links">
          <a className="hero-cta" href={profile.links.email}>
            <EmailIcon /> Email
          </a>
          <a className="hero-cta" href={profile.links.github} target="_blank" rel="noreferrer">
            <GhIcon /> GitHub
          </a>
          <a className="hero-cta" href={profile.links.blog} target="_blank" rel="noreferrer">
            <RssIcon /> Blog
          </a>
          <a className="hero-cta" href={profile.links.instagram} target="_blank" rel="noreferrer">
            <IgIcon /> Instagram
          </a>
          <a className="hero-cta" href={profile.links.linkedin} target="_blank" rel="noreferrer">
            <LiIcon /> LinkedIn
          </a>
        </div>
      </section>

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
          <p className="card-sub">개인 프로젝트와 실험 코드.</p>
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

        <Card span="sm" hoverable ariaLabel="awards">
          <div className="card-head">
            <span className="label">/ awards</span>
            <span className="chip">{awards.length}</span>
          </div>
          <h3 className="card-title">Awards</h3>
          <div className="card-body">
            <p className="card-sub mono">LATEST · {lastAward.year}</p>
            <p style={{ fontSize: "var(--text-sm)" }}>{lastAward.title}</p>
          </div>
          <div className="card-footer">
            <Link to="/awards" className="card-link">all awards</Link>
          </div>
        </Card>

        {/* row 4-6 : Certifications + Projects */}
        <Card span="sm" hoverable ariaLabel="certifications">
          <div className="card-head">
            <span className="label">/ certs · {certs.filter((c) => c.status === "active").length} active</span>
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
            <span className="chip">{projects.length}</span>
          </div>
          <h3 className="card-title">Selected</h3>
          <div className="card-body">
            <ul className="card-list">
              {selectedProjects.length ? selectedProjects.map((p, i) => (
                <li key={p.slug}>
                  <Link to={`/projects/${p.slug}`} className="project-list-link">
                    <span className="mono faint" style={{ marginRight: 8 }}>{String(i + 1).padStart(2, "0")}</span>
                    <span>{p.name}</span>
                  </Link>
                  <span className="mono faint">{p.year}</span>
                </li>
              )) : (
                <li>
                  <span className="mono faint">sync pending</span>
                  <span className="mono faint">--</span>
                </li>
              )}
            </ul>
          </div>
          <div className="card-footer">
            <Link to="/projects" className="card-link">all projects</Link>
          </div>
        </Card>

        {/* row 7-9 : Blog (md) + Skills (sm) */}
        <Card span="md" hoverable ariaLabel="featured writing">
          <div className="card-head">
            <span className="label">/ blog</span>
            <span className="chip">{posts.length} posts</span>
          </div>
          <span className="featured-eyebrow">FEATURED · {featured.date}</span>
          <h3 className="card-title" style={{ whiteSpace: "normal", fontSize: "var(--text-lg)" }}>
            {featured.title}
          </h3>
          <p className="card-sub">{featured.summary}</p>
          <div className="card-footer">
            <a className="card-link" href={profile.links.blog} target="_blank" rel="noreferrer">
              read on blog
            </a>
            <span className="mono faint">{featured.readMin} min · codingtips.tistory</span>
          </div>
        </Card>

        <Card span="sm" hoverable ariaLabel="skills" className="home-stack-card">
          <div className="card-head">
            <span className="label">/ skills · top langs</span>
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
            <span className="label">/ homelab · healthy</span>
            <StatusBadge
              status={errHosts ? "err" : warnHosts ? "warn" : "ok"}
              label={`${okHosts}/${hosts.length} ok`}
            />
          </div>
          <h3 className="card-title">Homelab</h3>
          <p className="card-sub">자가 호스팅 인프라.</p>
          <div className="card-body">
            <ul className="card-list">
              {hosts.slice(0, 3).map((h) => (
                <li key={h.name}>
                  <span className="mono">
                    <span style={{
                      display: "inline-block", width: 6, height: 6, borderRadius: 999,
                      background: h.status === "ok" ? "var(--ok)" : h.status === "warn" ? "var(--warn)" : "var(--err)",
                      marginRight: 8,
                    }} />
                    {h.name}
                  </span>
                  <span className="mono faint">{h.cpu}C · {h.mem}G</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-footer">
            <Link to="/homelab" className="card-link">console</Link>
          </div>
        </Card>

        <Card span="sm" hoverable ariaLabel="calendar">
          <div className="card-head">
            <span className="label">/ calendar · upcoming</span>
          </div>
          <h3 className="card-title">Next up</h3>
          <p className="card-sub mono">{nextEvent.date}{nextEvent.time ? ` · ${nextEvent.time}` : ""}</p>
          <div className="card-body">
            <p style={{ fontSize: "var(--text-sm)" }}>{nextEvent.title}</p>
          </div>
          <div className="card-footer">
            <Link to="/calendar" className="card-link">open calendar</Link>
          </div>
        </Card>

        <Card span="sm" hoverable ariaLabel="services" className="home-services-card">
          <div className="card-head">
            <span className="label">/ services</span>
            <span className="chip">{services.length} live</span>
          </div>
          <h3 className="card-title">Services</h3>
          <div className="card-body">
            <ul className="card-list">
              {services.slice(0, 2).map((s) => (
                <li key={s.name}>
                  <span className="mono">{s.name}</span>
                  <StatusBadge status={s.status} label={s.status === "ok" ? "ok" : s.status} />
                </li>
              ))}
            </ul>
          </div>
          <div className="card-footer">
            <Link to="/homelab" className="card-link">view all</Link>
            <span className="mono faint">99.98%</span>
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

/* ── icons (inline so SVGs always have explicit size) ───── */
function EmailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}
function GhIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48 0-.24-.01-.86-.01-1.69-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.12-1.47-1.12-1.47-.92-.62.07-.61.07-.61 1.01.07 1.55 1.04 1.55 1.04.9 1.54 2.36 1.1 2.94.84.09-.66.35-1.1.64-1.36-2.22-.25-4.55-1.11-4.55-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.86 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}
function RssIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}
function IgIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function LiIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4.98 3.5a2.5 2.5 0 1 1-.02 5.001A2.5 2.5 0 0 1 4.98 3.5ZM3 9.75h4v11.25H3V9.75Zm6.5 0h3.84v1.54h.05c.53-.96 1.84-1.97 3.78-1.97 4.05 0 4.8 2.66 4.8 6.13V21h-4v-5.32c0-1.27-.02-2.91-1.78-2.91-1.78 0-2.06 1.39-2.06 2.82V21h-4V9.75Z" />
    </svg>
  );
}
