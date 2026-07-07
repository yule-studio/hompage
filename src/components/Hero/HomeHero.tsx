import { profile } from "../../data/profile";
import { skills } from "../../data/skills";
import Nametag from "../Nametag/Nametag";
import WalkingCat from "../WalkingCat/WalkingCat";
import TypeCycle from "./TypeCycle";
import "./HomeHero.css";

const chips = skills[0].items
  .slice(0, 4)
  .map((s) => s.name.split(" /")[0].split(" (")[0].trim());

/**
 * HomeHero — portfolio-style hero: cascading intro text on the left, a
 * swinging ID nametag on the right. The cascade is gated by
 * `:root[data-intro="done"]` so it plays as the intro overlay wipes away.
 */
export default function HomeHero() {
  return (
    <section id="home" className="home-hero" aria-label="intro">
      <div className="home-hero-text">
        <span className="hh-eyebrow hh-reveal accent" style={d(0)}>
          ✦ AVAILABLE · Q3 2026
        </span>

        <h1 className="hh-title hh-reveal" style={d(120)}>
          {profile.name}
        </h1>

        <div className="hh-type hh-reveal" style={d(240)}>
          <TypeCycle
            words={["Backend Developer", "DevOps Engineer", "Homelab Tinkerer", "Happy coding!"]}
          />
        </div>

        <p className="hh-desc hh-reveal" style={d(360)}>
          {(() => {
            const mark = "습니다. ";
            const i = profile.bio.indexOf(mark);
            if (i === -1) return profile.bio;
            const cut = i + "습니다.".length;
            return (
              <>
                {profile.bio.slice(0, cut)}
                <br />
                {profile.bio.slice(cut).trimStart()}
              </>
            );
          })()}
        </p>

        <div className="hh-ctas hh-reveal" style={d(480)} aria-label="contact links">
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

        <div className="hh-chips hh-reveal" style={d(600)}>
          {chips.map((chip) => (
            <span className="hh-chip mono" key={chip}>
              {chip}
            </span>
          ))}
        </div>

        <span className="hh-scroll hh-reveal mono" style={d(760)}>
          ↓ scroll to explore
        </span>
      </div>

      <div className="home-hero-badge hh-reveal" style={d(320)}>
        <Nametag />
      </div>

      <WalkingCat />
    </section>
  );
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
