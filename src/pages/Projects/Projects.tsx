import Card from "../../components/Card/Card";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { projects, type Project } from "../../data/projects";

const statusTone: Record<Project["status"], "ok" | "info" | "warn" | "muted"> = {
  active: "ok",
  shipped: "info",
  paused: "warn",
  archived: "muted",
};

export default function Projects() {
  return (
    <>
      <header className="page-header">
        <div>
          <div className="page-eyebrow">/ projects</div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">현재 굴러가는 것 · 보낸 것 · 잠시 멈춘 것.</p>
        </div>
        <span className="chip mono">{projects.length} total</span>
      </header>

      <div className="section-grid">
        {projects.map((p) => (
          <Card key={p.slug} hoverable as="article" ariaLabel={`project ${p.name}`}>
            <div className="card-head">
              <h3 className="card-title">{p.name}</h3>
              <StatusBadge status={statusTone[p.status]} label={p.status} />
            </div>
            <p className="card-sub">{p.summary}</p>
            <div className="card-body" style={{ justifyContent: "flex-end" }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {p.tags.map((t) => (
                  <span key={t} className="chip">{t}</span>
                ))}
              </div>
            </div>
            <div className="card-footer">
              {p.repo ? (
                <a className="card-link" href={p.repo} target="_blank" rel="noreferrer">
                  view repo
                </a>
              ) : (
                <span className="mono faint">internal</span>
              )}
              <span className="mono faint">{p.year}</span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
