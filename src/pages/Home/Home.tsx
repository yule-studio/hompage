import { Link } from "react-router-dom";
import Card from "../../components/Card/Card";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import TerminalCard from "../../components/TerminalCard/TerminalCard";
import { profile } from "../../data/profile";
import { projects } from "../../data/projects";
import { posts } from "../../data/posts";
import { hosts, services } from "../../data/homelab";
import { events } from "../../data/events";
import { certs } from "../../data/certs";

/**
 * Home — dashboard summary of every page.
 *
 * Card spans are chosen so the 12-col dense grid stays packed
 * with no awkward gaps at the right edge. The first viewport is
 * intentionally dense (KPIs + terminal + status + recent work).
 */
export default function Home() {
  const recentProjects = projects.filter((p) => p.status === "active").slice(0, 4);
  const recentPosts = posts.slice(0, 4);
  const upcoming = events.slice(0, 4);

  const okHosts = hosts.filter((h) => h.status === "ok").length;
  const warnHosts = hosts.filter((h) => h.status === "warn").length;
  const errHosts = hosts.filter((h) => h.status === "err").length;

  return (
    <>
      <header className="page-header">
        <div>
          <div className="page-eyebrow">root@yule.studio — login as guest</div>
          <h1 className="page-title">
            안녕하세요, <span className="accent">{profile.name}</span> 입니다.
          </h1>
          <p className="page-subtitle">{profile.bio}</p>
        </div>
        <StatusBadge status="ok" label={`uptime · ${profile.uptimeDays}d`} />
      </header>

      <div className="grid">
        {/* ── identity + KPIs (wide top card) ────────────── */}
        <Card span="lg" ariaLabel="profile summary">
          <div className="card-head">
            <span className="label">/ identity</span>
            <StatusBadge status={profile.status.tone} label={profile.status.label} />
          </div>
          <div className="card-body">
            <div className="kpi-row">
              <div className="kpi">
                <span className="kpi-value">{projects.length}</span>
                <span className="kpi-label">projects</span>
              </div>
              <div className="kpi">
                <span className="kpi-value">{posts.length}</span>
                <span className="kpi-label">posts</span>
              </div>
              <div className="kpi">
                <span className="kpi-value">{certs.length}</span>
                <span className="kpi-label">certs</span>
              </div>
              <div className="kpi">
                <span className="kpi-value">{hosts.length}</span>
                <span className="kpi-label">hosts</span>
              </div>
              <div className="kpi">
                <span className="kpi-value">{services.length}</span>
                <span className="kpi-label">services</span>
              </div>
            </div>
            <p className="muted" style={{ fontSize: "var(--text-sm)", marginTop: "auto" }}>
              {profile.role} · {profile.location} · {profile.region}
            </p>
          </div>
          <div className="card-footer">
            <Link to="/projects" className="card-link">go to projects</Link>
            <span className="mono faint">{profile.handle}</span>
          </div>
        </Card>

        {/* ── terminal preview ───────────────────────────── */}
        <TerminalCard
          span="md"
          lines={[
            { kind: "comment", text: "init ok — running as guest" },
            { kind: "cmd", text: "whoami" },
            { kind: "out", text: profile.handle },
            { kind: "cmd", text: "uptime" },
            { kind: "out", text: `up ${profile.uptimeDays} days · region=${profile.region}` },
            { kind: "cmd", text: "ls /pages" },
            { kind: "out", text: "home projects skills awards certs homelab calendar blog contact" },
          ]}
        />

        {/* ── homelab status (md) ────────────────────────── */}
        <Card span="md" hoverable ariaLabel="homelab status">
          <div className="card-head">
            <span className="label">/ homelab</span>
            <StatusBadge
              status={errHosts ? "err" : warnHosts ? "warn" : "ok"}
              label={`${okHosts}/${hosts.length} ok`}
            />
          </div>
          <div className="card-body">
            <ul className="card-list">
              {hosts.slice(0, 4).map((h) => (
                <li key={h.name}>
                  <span className="mono">{h.name}</span>
                  <StatusBadge status={h.status} label={`${h.cpu}% cpu`} />
                </li>
              ))}
            </ul>
          </div>
          <div className="card-footer">
            <Link to="/homelab" className="card-link">open homelab console</Link>
          </div>
        </Card>

        {/* ── active projects (sm) ───────────────────────── */}
        <Card span="sm" hoverable ariaLabel="active projects">
          <div className="card-head">
            <span className="label">/ active projects</span>
            <span className="chip">{recentProjects.length}</span>
          </div>
          <div className="card-body">
            <ul className="card-list">
              {recentProjects.map((p) => (
                <li key={p.slug}>
                  <span>{p.name}</span>
                  <span className="mono faint">{p.year}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-footer">
            <Link to="/projects" className="card-link">all projects</Link>
          </div>
        </Card>

        {/* ── recent posts (sm) ──────────────────────────── */}
        <Card span="sm" hoverable ariaLabel="recent posts">
          <div className="card-head">
            <span className="label">/ recent posts</span>
            <span className="chip">{recentPosts.length}</span>
          </div>
          <div className="card-body">
            <ul className="card-list">
              {recentPosts.map((p) => (
                <li key={p.slug}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.title}
                  </span>
                  <span className="mono faint">{p.date.slice(5)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-footer">
            <Link to="/blog" className="card-link">open blog</Link>
          </div>
        </Card>

        {/* ── upcoming events (sm) ───────────────────────── */}
        <Card span="sm" hoverable ariaLabel="upcoming events">
          <div className="card-head">
            <span className="label">/ upcoming</span>
            <StatusBadge status="info" label="next 4" />
          </div>
          <div className="card-body">
            <ul className="card-list">
              {upcoming.map((e) => (
                <li key={e.date + e.title}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.title}
                  </span>
                  <span className="mono faint">{e.date.slice(5)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-footer">
            <Link to="/calendar" className="card-link">open calendar</Link>
          </div>
        </Card>

        {/* ── services row (wide) ────────────────────────── */}
        <Card span="wide" hoverable ariaLabel="services">
          <div className="card-head">
            <span className="label">/ services</span>
            <span className="chip">{services.length}</span>
          </div>
          <div className="card-body">
            <ul
              className="card-list"
              style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--space-2)" }}
            >
              {services.map((s) => (
                <li key={s.name}>
                  <span>
                    <span className="mono">{s.name}</span>
                    <span className="faint mono"> · {s.host}</span>
                  </span>
                  <StatusBadge status={s.status} label={s.status === "ok" ? "ok" : s.status} />
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* ── stack glance (sm) ──────────────────────────── */}
        <Card span="sm" ariaLabel="now stack">
          <div className="card-head">
            <span className="label">/ now</span>
            <StatusBadge status="ok" label="shipping" />
          </div>
          <div className="card-body">
            <ul className="card-list">
              <li><span>Python · TypeScript</span><span className="mono faint">lang</span></li>
              <li><span>FastAPI · React</span><span className="mono faint">app</span></li>
              <li><span>Postgres · Redis</span><span className="mono faint">data</span></li>
              <li><span>k3s · Cloudflare</span><span className="mono faint">infra</span></li>
            </ul>
          </div>
          <div className="card-footer">
            <Link to="/skills" className="card-link">all skills</Link>
          </div>
        </Card>
      </div>
    </>
  );
}
