import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { type Project } from "../../data/projects";
import { certs, type Cert } from "../../data/certs";
import { skills } from "../../data/skills";
import { hosts, services } from "../../data/homelab";

/**
 * PosterGrid — every showcase tab as the same dense poster grid. Nothing here
 * has artwork to show, so each tile generates its own: a wash tinted by the
 * item's key (language / issuer / group / host role), an oversized mark sunk
 * into the background, and the name set large as the poster's subject.
 */

type Tone = "live" | "active" | "shipped" | "paused" | "archived" | "progress" | "warn";

/* ── colour ─────────────────────────────────────────────────── */

/** GitHub linguist colours, so a language reads the same here as on the repo. */
const LANG_COLOR: Record<string, string> = {
  typescript: "#3178c6",
  javascript: "#f1e05a",
  python: "#3572a5",
  go: "#00add8",
  java: "#b07219",
  kotlin: "#a97bff",
  rust: "#dea584",
  c: "#555555",
  "c++": "#f34b7d",
  "c#": "#178600",
  ruby: "#701516",
  php: "#4f5d95",
  swift: "#f05138",
  dart: "#00b4ab",
  shell: "#89e051",
  html: "#e34c26",
  css: "#563d7c",
  vue: "#41b883",
  scala: "#c22d40",
  lua: "#000080",
  jupyter: "#da5b0b",
  dockerfile: "#384d54",
};

/**
 * Items with no colour of their own would otherwise leave a wall of identical
 * tiles — most of this archive is "Mixed". Derive a stable hue from the item's
 * name instead, so those still read apart at a glance.
 */
function hashHue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

function seededColor(seed: string): string {
  return `hsl(${hashHue(seed)} 58% 48%)`;
}

function langColor(lang: string, seed: string): string {
  return LANG_COLOR[lang.trim().toLowerCase()] ?? seededColor(seed);
}

/* ── shared tile ────────────────────────────────────────────── */

type TileProps = {
  /** short code printed top-left and as the background watermark */
  mark: string;
  /** number / short value printed top-right */
  badge: string;
  /** the poster's subject, set large */
  name: string;
  color: string;
  status?: { label: string; tone: Tone };
  /** optional extra row above the status (e.g. a level bar) */
  extra?: ReactNode;
  /** caption under the poster */
  caption: string;
  sub: string;
  /** wraps the tile in a link when the item has somewhere to go */
  href?: string;
  to?: string;
  /** position in the grid — drives the one-by-one entrance stagger */
  index: number;
};

function Tile({ mark, badge, name, color, status, extra, caption, sub, href, to, index }: TileProps) {
  const body = (
    <>
      <article className="pg-poster">
        <span className="pg-watermark" aria-hidden>
          {mark}
        </span>

        <header className="pg-poster-top mono">
          <span className="pg-lang">{mark}</span>
          <span className="pg-no">{badge}</span>
        </header>

        <h3 className="pg-poster-name">{name}</h3>

        {extra}

        {status && (
          <footer className="pg-poster-foot">
            <span className={`sc-status sc-status--${status.tone}`}>
              <i /> {status.label}
            </span>
          </footer>
        )}
      </article>

      <div className="pg-meta">
        <span className="pg-title">{caption}</span>
        <span className="pg-sub mono">{sub}</span>
      </div>
    </>
  );

  const style = { ["--lang" as string]: color, ["--i" as string]: index } as React.CSSProperties;

  if (to) {
    return (
      <Link to={to} className="pg-item" style={style}>
        {body}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="pg-item" style={style}>
        {body}
      </a>
    );
  }
  return (
    <div className="pg-item pg-item--static" style={style}>
      {body}
    </div>
  );
}

/**
 * Grid — holds the tiles and, while it is in view, flips `is-in` so they
 * cascade in one after another (the stagger delay lives in CSS, keyed off each
 * tile's `--i`). It replays every time the grid is scrolled back to, and on
 * tab change, so arriving here always animates.
 */
function Grid({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        // replays on every arrival, like the sections around it
        setInView(entries.some((e) => e.isIntersecting));
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`pgrid${inView ? " is-in" : ""}`} ref={ref}>
      {children}
    </div>
  );
}

/* ── projects ───────────────────────────────────────────────── */

const LANG_MARK: Record<string, string> = {
  typescript: "TS",
  javascript: "JS",
  python: "PY",
  go: "GO",
  java: "JAVA",
  kotlin: "KT",
  rust: "RS",
  ruby: "RB",
  swift: "SW",
  shell: "SH",
  dockerfile: "DOCKER",
  jupyter: "IPYNB",
  mixed: "MX",
};

function projStatus(p: Project): { label: string; tone: Tone } {
  if (p.homepageUrl) return { label: "LIVE", tone: "live" };
  switch (p.status) {
    case "shipped":
      return { label: "SHIPPED", tone: "shipped" };
    case "paused":
      return { label: "PAUSED", tone: "paused" };
    case "archived":
      return { label: "ARCHIVED", tone: "archived" };
    default:
      return { label: "ACTIVE", tone: "active" };
  }
}

export function ProjectGrid({
  projects,
  isLoading,
}: {
  projects: Project[];
  isLoading: boolean;
}) {
  if (!projects.length) {
    return <div className="pgrid-empty mono">{isLoading ? "아카이브 동기화 중…" : "기록 없음"}</div>;
  }

  return (
    <Grid>
      {projects.map((p, i) => {
        const lang = p.language || "Mixed";
        const key = lang.trim().toLowerCase();
        return (
          <Tile
            key={p.slug}
            index={i}
            mark={LANG_MARK[key] ?? lang.slice(0, 4).toUpperCase()}
            badge={String(i + 1).padStart(2, "0")}
            name={p.name}
            color={langColor(lang, p.slug)}
            status={projStatus(p)}
            caption={p.name}
            sub={`${lang} · ${p.year}`}
            to={`/projects/${p.slug}`}
          />
        );
      })}
    </Grid>
  );
}

/* ── certificates ───────────────────────────────────────────── */

function certStatus(c: Cert): { label: string; tone: Tone } {
  if (c.status === "in-progress") return { label: "IN PROGRESS", tone: "progress" };
  if (c.status === "expired") return { label: "EXPIRED", tone: "archived" };
  return { label: "ACTIVE", tone: "active" };
}

export function CertGrid() {
  return (
    <Grid>
      {certs.map((c, i) => (
        <Tile
          key={c.id ?? c.name}
          index={i}
          mark="CERT"
          badge={String(c.year)}
          name={c.name}
          color={seededColor(c.issuer)}
          status={certStatus(c)}
          caption={c.name}
          sub={c.issuer}
        />
      ))}
    </Grid>
  );
}

/* ── tech stack ─────────────────────────────────────────────── */

const techItems = skills.flatMap((g) => g.items.map((s) => ({ ...s, group: g.group })));

export function TechGrid() {
  return (
    <Grid>
      {techItems.map((t, i) => (
        <Tile
          key={`${t.group}-${t.name}`}
          index={i}
          mark={t.group.slice(0, 4).toUpperCase()}
          badge={String(t.level)}
          name={t.name}
          color={langColor(t.name, t.group + t.name)}
          caption={t.name}
          sub={t.note ?? t.group}
          extra={
            <div className="pg-bar" aria-hidden>
              <span style={{ width: `${t.level}%` }} />
            </div>
          }
        />
      ))}
    </Grid>
  );
}

/* ── homelab ────────────────────────────────────────────────── */

function hostTone(s: "ok" | "warn" | "err"): { label: string; tone: Tone } {
  if (s === "ok") return { label: "HEALTHY", tone: "active" };
  if (s === "warn") return { label: "WARN", tone: "warn" };
  return { label: "ERROR", tone: "archived" };
}

export function HomelabGrid() {
  return (
    <Grid>
      {hosts.map((h, i) => (
        <Tile
          key={h.name}
          index={i}
          mark="NODE"
          badge={h.uptime}
          name={h.name}
          color={seededColor(h.role)}
          status={hostTone(h.status)}
          caption={h.name}
          sub={`${h.role} · cpu ${h.cpu}% · mem ${h.mem}%`}
          extra={
            <div className="pg-bar" aria-hidden>
              <span style={{ width: `${h.cpu}%` }} />
            </div>
          }
        />
      ))}

      {services.map((s, i) => (
        <Tile
          key={s.name}
          index={hosts.length + i}
          mark="SVC"
          badge={s.host}
          name={s.name}
          color={seededColor(s.name)}
          status={hostTone(s.status)}
          caption={s.name}
          sub={s.url ? `on ${s.host} · open ↗` : `on ${s.host} · internal`}
          href={s.url}
        />
      ))}
    </Grid>
  );
}
