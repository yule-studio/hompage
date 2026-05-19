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

export default function Projects() {
  const { projects, isLoading } = useProjects();

  return (
    <>
      <header className="page-header">
        <div>
          <div className="page-eyebrow">/ projects</div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">GitHub public repo 기준으로 동기화한 프로젝트.</p>
        </div>
        <span className="chip mono">{isLoading ? "sync" : `${projects.length} total`}</span>
      </header>

      <Navigation />

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

        {projects.map((p) => (
          <Card key={p.slug} hoverable as="article" ariaLabel={`project ${p.name}`} className="project-card">
            <div className="card-head">
              <h3 className="card-title">
                <Link to={`/projects/${p.slug}`}>{p.name}</Link>
              </h3>
              <StatusBadge status={statusTone[p.status]} label={p.status} />
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
              <span className="mono faint">{p.year}</span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
