import { useEffect, useState } from "react";
import { useProjects } from "../../hooks/useProjects";
import { CertGrid, HomelabGrid, ProjectGrid, TechGrid } from "./PosterGrid";
import {
  getShowcaseTab,
  setShowcaseTab,
  subscribeShowcaseTab,
  type TabId,
} from "./showcaseTab";
import "./Showcase.css";

/**
 * PortfolioShowcase — one archive, four tabs (Projects / Certificates /
 * Tech Stack / Homelab), each rendered as the same full-bleed poster grid.
 *
 * The topbar's "Homelab" link still points at #homelab; the anchor lives in
 * this section, so following it scrolls here AND selects the Homelab tab.
 */

const TABS: { id: TabId; label: string }[] = [
  { id: "projects", label: "Projects" },
  { id: "certificates", label: "Certificates" },
  { id: "techstack", label: "Tech Stack" },
  { id: "homelab", label: "Homelab" },
];

export default function PortfolioShowcase() {
  const { projects, isLoading } = useProjects();
  // deep link: /#homelab lands on the Homelab tab
  const [tab, setTab] = useState<TabId>(() =>
    window.location.hash === "#homelab" ? "homelab" : getShowcaseTab(),
  );

  // the topbar can select a tab too, so mirror the shared value both ways
  useEffect(() => {
    setShowcaseTab(tab);
  }, [tab]);

  useEffect(() => subscribeShowcaseTab(setTab), []);

  return (
    <div className="showcase">
      {/* scroll target for the topbar's Homelab link */}
      <span id="homelab" className="showcase-anchor" aria-hidden />

      <header className="showcase-head">
        <span className="showcase-eyebrow mono">// PORTFOLIO SHOWCASE</span>
        <h2 className="showcase-title">Portfolio Showcase</h2>
        <p className="showcase-sub">
          프로젝트 · 자격증 · 기술 스택 · 홈랩 — 카드로 살펴보기.
        </p>
      </header>

      <div className="showcase-tabs" role="tablist" aria-label="portfolio tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`showcase-tab${tab === t.id ? " is-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="showcase-body" key={tab}>
        {tab === "projects" && <ProjectGrid projects={projects} isLoading={isLoading} />}
        {tab === "certificates" && <CertGrid />}
        {tab === "techstack" && <TechGrid />}
        {tab === "homelab" && <HomelabGrid />}
      </div>
    </div>
  );
}
