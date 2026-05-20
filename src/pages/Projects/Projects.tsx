import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/Card/Card";
import Navigation from "../../components/Navigation/Navigation";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { type Project } from "../../data/projects";
import { useProjects } from "../../hooks/useProjects";

const statusTone: Record<Project["status"], "ok" | "info" | "warn" | "muted"> = {
  active: "ok",
  shipped: "info",
  paused: "warn",
  archived: "muted",
};

type Filter = "all" | "live" | "code";

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All" },
  { id: "live", label: "Live · 실행 가능" },
  { id: "code", label: "Code-only · GitHub" },
];

function isLive(p: Project): boolean {
  return Boolean(p.homepageUrl);
}

export default function Projects() {
  const { projects, isLoading } = useProjects();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "live") return projects.filter(isLive);
    if (filter === "code") return projects.filter((p) => !isLive(p));
    return projects;
  }, [projects, filter]);

  const liveCount = projects.filter(isLive).length;

  return (
    <>
      <header className="page-header">
        <div>
          <div className="page-eyebrow">/ projects</div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">
            GitHub public repo 기준으로 동기화. <strong>Live</strong> 는 homepage_url 이 설정된 (배포된) repo.
          </p>
        </div>
        <span className="chip mono">
          {isLoading ? "sync" : `${liveCount} live · ${projects.length} total`}
        </span>
      </header>

      <Navigation />

      <div className="filter-bar" role="tablist" aria-label="프로젝트 필터">
        {FILTERS.map((f) => {
          const count = f.id === "all"
            ? projects.length
            : f.id === "live" ? liveCount : projects.length - liveCount;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className="filter-tab"
              onClick={() => setFilter(f.id)}
            >
              <span>{f.label}</span>
              <span className="mono faint">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="section-grid">
        {!projects.length ? (
          <Card hoverable as="article" ariaLabel="projects loading">
            <div className="card-head">
              <span className="label">/ github sync</span>
              <StatusBadge status={isLoading ? "info" : "warn"} label={isLoading ? "loading" : "empty"} />
            </div>
            <h3 className="card-title">Projects</h3>
            <p className="card-sub">
              {isLoading ? "GitHub 프로젝트 목록을 불러오는 중입니다." : "동기화된 public repo가 없습니다."}
            </p>
          </Card>
        ) : null}

        {filtered.map((p) => {
          const live = isLive(p);
          return (
            <Card
              key={p.slug}
              hoverable
              as="article"
              ariaLabel={`project ${p.name}`}
              className={`project-card ${live ? "project-card--live" : ""}`}
            >
              <div className="card-head">
                <h3 className="card-title">
                  <Link to={`/projects/${p.slug}`}>{p.name}</Link>
                </h3>
                {live ? (
                  <StatusBadge status="ok" label="LIVE" />
                ) : (
                  <StatusBadge status={statusTone[p.status]} label={p.status} />
                )}
              </div>
              <p className="card-sub">{p.summary}</p>
              <div className="card-body project-card-body">
                <div className="chip-row">
                  {p.tags.map((t) => (
                    <span key={t} className="chip">{t}</span>
                  ))}
                </div>
              </div>
              <div className="card-footer">
                <Link to={`/projects/${p.slug}`} className="card-link">open project</Link>
                <span className="mono faint">
                  {live && p.homepageUrl ? (
                    <>
                      <a className="project-live-link" href={p.homepageUrl} target="_blank" rel="noreferrer">
                        ↗ live
                      </a>
                      {" · "}
                    </>
                  ) : null}
                  {p.year}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
