import { useState } from "react";
import { activities, type Activity } from "../../data/activities";
import { profile } from "../../data/profile";
import { setShowcaseTab } from "../Showcase/showcaseTab";
import ActivityModal from "./ActivityModal";
import "./About.css";

/**
 * About — portofoliov1's About section in our theme: the name set large with
 * bio, a quote and the two PDF downloads.
 *
 * portofoliov1 fills the row underneath with project/certificate counters;
 * ours carries the activity record instead — the counts are already one scroll
 * away in the showcase, and the record (which covers both jobs) isn't listed
 * anywhere else.
 *
 * The two PDFs are served straight from `public/docs/` under fixed names, so
 * refreshing either one is a file swap — no code change.
 */

const RESUME_PDF = `${import.meta.env.BASE_URL}docs/resume.pdf`;
const PORTFOLIO_PDF = `${import.meta.env.BASE_URL}docs/portfolio.pdf`;

export default function About() {
  const [open, setOpen] = useState<Activity | null>(null);

  const viewProjects = () => {
    setShowcaseTab("projects");
    document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="about">
      <div className="about-main">
        <div className="about-text">
          <span className="about-eyebrow mono">// ABOUT ME</span>

          <h2 className="about-name">{profile.name}</h2>

          <div className="about-quote">
            <p className="about-quote-line">{profile.tagline}</p>
            <p className="about-quote-ko">{profile.taglineKo}</p>
          </div>

          <div className="about-actions">
            <a className="about-btn" href={RESUME_PDF} download="오유찬_이력서.pdf">
              <FileIcon /> 이력서 PDF
            </a>
            <a className="about-btn" href={PORTFOLIO_PDF} download="오유찬_포트폴리오.pdf">
              <FileIcon /> 포트폴리오 PDF
            </a>
            <button type="button" className="about-btn" onClick={viewProjects}>
              <ArrowIcon /> View Projects
            </button>
          </div>
        </div>
      </div>

      <section className="about-acts" aria-label="주요 활동 이력">
        <header className="about-exp-head">
          <span className="about-exp-eyebrow mono">// ACTIVITY</span>
          <h3 className="about-exp-title">주요 활동 이력</h3>
          <p className="about-act-hint mono">
            <span className="about-act-hint-mark" aria-hidden>
              자세히 →
            </span>
            표시가 있는 항목은 클릭하면 자세한 기록을 볼 수 있습니다.
          </p>
        </header>

        {/* two dense columns, flowing down the first then continuing in the
            second — the record reads chronologically either way */}
        <ul className="about-act-list">
          {activities.map((a) => (
            <li
              className={`about-act${a.highlight ? " about-act--key" : ""}${a.detail ? " about-act--open" : ""}`}
              key={`${a.at}-${a.title}`}
            >
              <span className="about-act-date mono">{a.period}</span>
              <span className="about-act-title">
                {a.detail ? (
                  // entries with a written-up detail open a popup
                  <button type="button" className="about-act-btn" onClick={() => setOpen(a)}>
                    {a.title}
                    <span className="about-act-more mono" aria-hidden>
                      자세히 →
                    </span>
                  </button>
                ) : a.url ? (
                  <a href={a.url} target="_blank" rel="noreferrer">
                    {a.title}
                  </a>
                ) : (
                  a.title
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {open && <ActivityModal activity={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

/* ── icons ──────────────────────────────────────────────────── */
function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M12 12v5M9.5 14.5 12 17l2.5-2.5" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}
