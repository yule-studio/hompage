import { Suspense, lazy, useEffect, useState } from "react";
import { profile } from "../../data/profile";
import WalkingCat from "../WalkingCat/WalkingCat";
import TypeCycle from "./TypeCycle";
import "./HomeHero.css";

// three.js + rapier are heavy; keep them out of the initial bundle
const Band = lazy(() => import("../Band/Band"));

// main-language order (most-used first)
const chips = ["Java", "Python", "Go", "JavaScript", "TypeScript"];

/**
 * HomeHero — portofoliov1's hero form: a full-viewport section with the intro
 * cascade pinned left, the 3D lanyard badge hanging over the whole area, and a
 * scroll cue centred at the bottom. The badge only mounts once the intro
 * overlay has wiped away (`:root[data-intro="done"]`), mirroring portofoliov1's
 * `showApp` gate.
 */
export default function HomeHero() {
  const introDone = useIntroDone();
  // the lanyard is desktop-only, so mobile never pays for the three.js chunk
  const isDesktop = useIsDesktop();
  const showBand = introDone && isDesktop;

  return (
    <section id="home" className="home-hero" aria-label="intro">
      {/* BAND LAYER — the lanyard swings across the whole hero */}
      <div className="home-hero-band">
        {showBand && (
          <Suspense fallback={null}>
            <Band />
          </Suspense>
        )}
      </div>

      {/* TEXT */}
      <div className="home-hero-text">
        <WalkingCat />

        <span className="hh-eyebrow hh-reveal accent" style={d(0)}>
          ✦ AVAILABLE · Q3 2026
        </span>

        <h1 className="hh-title hh-reveal" style={d(120)}>
          {profile.name}
        </h1>
        <h1 className="hh-title hh-title--muted hh-reveal" style={d(240)}>
          Backend Developer
        </h1>

        <div className="hh-type hh-reveal" style={d(360)}>
          <TypeCycle
            words={["Backend Developer", "DevOps Engineer", "Homelab Tinkerer", "Happy coding!"]}
          />
        </div>

        <p className="hh-desc hh-reveal" style={d(480)}>
          {bioLines().map((line, idx, all) => (
            <span key={idx}>
              {line}
              {idx < all.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>

        <div className="hh-ctas hh-reveal" style={d(600)} aria-label="contact links">
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

        <div className="hh-chips hh-reveal" style={d(720)}>
          {chips.map((chip) => (
            <span className="hh-chip mono" key={chip}>
              {chip}
            </span>
          ))}
        </div>

        <div className="hh-foot hh-reveal" style={d(840)}>
          <span className="mono">↓ explore my work below</span>
          <span className="mono">↗ self-hosted homelab · seoul</span>
        </div>
      </div>

      {/* SCROLL INDICATOR */}
      <div className="hh-scrollcue hh-reveal" style={d(1000)}>
        <span className="hh-scrollcue-inner">
          <span className="mono">Scroll</span>
          <span aria-hidden>↓</span>
        </span>
      </div>
    </section>
  );
}

/**
 * True once the intro overlay has finished (it stamps
 * `document.documentElement.dataset.intro = "done"`). Off-home loads set it
 * before mount, so this starts true there.
 */
function useIntroDone(): boolean {
  const [done, setDone] = useState(
    () => document.documentElement.dataset.intro === "done",
  );

  useEffect(() => {
    if (done) return;
    const observer = new MutationObserver(() => {
      if (document.documentElement.dataset.intro === "done") {
        setDone(true);
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-intro"],
    });
    return () => observer.disconnect();
  }, [done]);

  return done;
}

/** Matches Band's own 768px cutoff — below it the lanyard is not rendered. */
function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return desktop;
}

/** Break the bio after the first sentence, and again before "여러". */
function bioLines(): string[] {
  let rest = profile.bio;
  const lines: string[] = [];
  const i1 = rest.indexOf("습니다. ");
  if (i1 !== -1) {
    lines.push(rest.slice(0, i1 + "습니다.".length));
    rest = rest.slice(i1 + "습니다. ".length);
  }
  const i2 = rest.indexOf("여러");
  if (i2 !== -1) {
    lines.push(rest.slice(0, i2).trimEnd());
    lines.push(rest.slice(i2));
  } else {
    lines.push(rest);
  }
  return lines;
}

function d(ms: number) {
  return { "--d": `${ms}ms` } as React.CSSProperties;
}

/* ── icons ──────────────────────────────────────────────────── */
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
