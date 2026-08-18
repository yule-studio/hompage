import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { type Project } from "../../data/projects";
import { certs, type Cert } from "../../data/certs";
import { skills } from "../../data/skills";
import { hosts, services } from "../../data/homelab";
import { projectDemos, type ProjectDemo } from "../../data/projectDemos";
import { useClipInView } from "../../hooks/useClipInView";

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
  /** plays over the poster art on its own, for as long as the tile is on screen */
  demo?: ProjectDemo;
  /** wraps the tile in a link when the item has somewhere to go */
  href?: string;
  to?: string;
  /** position in the grid — drives the one-by-one entrance stagger */
  index: number;
};

/*
 * The demo inside a tile.
 *
 * A single long clip playing behind the type read as "a video is running" — you
 * could not say what it showed. Cut by section it becomes a tour: a separate
 * card per screen of the site, strung along one band that runs behind the tile.
 *
 * The card in the middle is the big one and it plays; the cards either side are
 * the same card at a smaller size, cut off by the tile's edges. When a clip ends
 * the band moves one place along — the card that was playing shrinks as it
 * leaves the middle and the next one grows into it.
 *
 * It only ever moves one way. The band carries three passes of the sections and
 * starts on the middle one, so when the track reaches the same spot a pass
 * later it can be wound back by one pass with the transition off: every card in
 * view, and both neighbours, are identical either side of that move, so nothing
 * on screen changes and the band appears to run on forever. The wind-back
 * happens after the slide and before the next clip starts, so no clip is ever
 * cut short by it.
 *
 * Clips run at the project's `rate`, because a recording made at reading speed
 * is unfollowable once it is a thumbnail. Only the card in the middle is loaded
 * and playing, the rest wait at `preload="none"`, and the band stops the moment
 * the tile scrolls off.
 */

/** how long the band takes to carry one card into the middle — mirrors the CSS */
const SLIDE_MS = 1150;

/**
 * Where each card grows from and shrinks back to.
 *
 * A card scaled about its centre grows evenly on all four sides, and six of
 * those in a row is a metronome. Giving each card its own corner to open out of
 * — this one from the top, the next from the bottom, another folding away to
 * the left — makes the band feel handmade instead of generated, which is the
 * whole point of the motion.
 *
 * Assigned by section index, not by position on the belt, so a section grows
 * the same way on every pass and the wind-back stays invisible. The horizontal
 * halves are kept off the extremes: at 0% or 100% a card can fold entirely out
 * of view and leave a gap at the tile's edge.
 */
const GROW_FROM = ["50% 0%", "50% 100%", "20% 100%", "80% 0%", "20% 0%", "80% 100%"];

function DemoScreen({ demo, fallbackLabel }: { demo: ProjectDemo; fallbackLabel: string }) {
  const sections = demo.sections ?? [];
  const rate = demo.rate ?? 1;
  const count = sections.length;

  /* three passes of the same sections — see the note about winding back */
  const belt = count ? [...sections, ...sections, ...sections] : [];

  /* start on the middle pass so there is a card to the left from the first frame */
  const [pos, setPos] = useState(count);
  const [snapping, setSnapping] = useState(false);
  const [visible, setVisible] = useState(false);
  const stage = useRef<HTMLSpanElement>(null);
  const clips = useRef<(HTMLVideoElement | null)[]>([]);

  /* the tile has to be on screen for any of this to be worth doing */
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.2,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /*
   * Play whatever is in the middle — unless the band has run a full pass past
   * where it started, in which case let the slide finish and wind the track back
   * by one pass. What is on screen is identical either side of that, and it
   * happens before anything starts playing, so no clip is cut off mid-way.
   */
  useEffect(() => {
    if (!count) return;

    if (pos === count * 2) {
      const t = window.setTimeout(() => {
        setSnapping(true);
        setPos(count);
      }, SLIDE_MS);
      return () => window.clearTimeout(t);
    }

    const el = clips.current[pos];
    if (!el) return;
    if (!visible) {
      el.pause();
      return;
    }
    el.playbackRate = rate;
    el.currentTime = 0;
    void el.play().catch(() => {
      /* autoplay policy or a codec the browser won't take — poster stays */
    });

    const next = clips.current[pos + 1];
    if (next && next.preload === "none") {
      next.preload = "auto";
      next.load();
    }
    // `snapping` is deliberately not a dependency: it flips right after the jump
    // and re-running here would restart the clip that just started.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, visible, rate, count]);

  /* transitions come back the frame after the jump, never during it */
  useEffect(() => {
    if (!snapping) return;
    const raf = requestAnimationFrame(() => setSnapping(false));
    return () => cancelAnimationFrame(raf);
  }, [snapping]);

  /* a project with no section cuts yet — the whole walkthrough in one window */
  if (!count) {
    return (
      <span className="pg-screen" aria-hidden>
        <span className="pg-screen-bar">
          <i />
          <i />
          <i />
          <span className="pg-screen-url mono">{fallbackLabel}</span>
        </span>
        <SingleClip demo={demo} />
        <span className="pg-screen-glare" />
      </span>
    );
  }

  /* a clip reached its end — hand the middle to the next card */
  const advance = () => setPos((p) => p + 1);

  return (
    <span ref={stage} className="pg-stage" aria-hidden>
      <span className="pg-deck">
      <span
        className={`pg-belt${snapping ? " is-snapping" : ""}`}
        style={{ ["--pos" as string]: pos } as React.CSSProperties}
      >
        {belt.map((section, i) => (
          <span
            key={`${section.src}-${i}`}
            className={`pg-card${i === pos ? " is-on" : ""}`}
            style={
              { ["--grow-from" as string]: GROW_FROM[i % count % GROW_FROM.length] } as React.CSSProperties
            }
          >
            <span className="pg-card-bar">
              <i />
              <i />
              <i />
              <span className="pg-card-name mono">
                <b>{String((i % count) + 1).padStart(2, "0")}</b> {section.label}
              </span>
            </span>
            <video
              ref={(el) => {
                clips.current[i] = el;
              }}
              className="pg-shot"
              src={section.src}
              poster={section.poster}
              muted
              playsInline
              preload="none"
              onEnded={i === pos ? advance : undefined}
            />
            <span className="pg-card-glare" />
          </span>
        ))}
      </span>
      </span>

      {/* chapters — how many screens there are and which one is up */}
      <span className="pg-chapters">
        {sections.map((section, i) => (
          <i key={section.src} className={i === pos % count ? "is-on" : undefined} />
        ))}
      </span>
    </span>
  );
}

/** a project with no section cuts yet — the whole walkthrough, looped */
function SingleClip({ demo }: { demo: ProjectDemo }) {
  const video = useClipInView();
  return (
    <video
      ref={video}
      className="pg-demo is-on"
      src={demo.src}
      poster={demo.poster}
      muted
      loop
      playsInline
      preload="none"
    />
  );
}

function Tile({ mark, badge, name, color, status, extra, caption, sub, demo, href, to, index }: TileProps) {
  const body = (
    <>
      <article className="pg-poster">
        {demo && <DemoScreen demo={demo} fallbackLabel={caption} />}

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

  const cls = `pg-item${demo ? " pg-item--demo" : ""}`;

  if (to) {
    return (
      <Link to={to} className={cls} style={style}>
        {body}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls} style={style}>
        {body}
      </a>
    );
  }
  return (
    <div className={`${cls} pg-item--static`} style={style}>
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
            demo={projectDemos[p.slug]}
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
