import { Link, useParams } from "react-router-dom";
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

export default function ProjectDetail() {
  const { slug } = useParams();
  const { projects, isLoading } = useProjects();
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    return (
      <>
        <header className="page-header">
          <div>
            <div className="page-eyebrow">/ projects</div>
            <h1 className="page-title">{isLoading ? "Loading" : "Project not found"}</h1>
            <p className="page-subtitle">
              {isLoading ? "GitHub 프로젝트 정보를 불러오는 중입니다." : "동기화된 프로젝트 목록에 없는 경로입니다."}
            </p>
          </div>
        </header>

        <Navigation />
        <Link to="/#projects" className="back-link">프로젝트 목록으로</Link>
      </>
    );
  }

  return (
    <>
      <header className="page-header">
        <div>
          <div className="page-eyebrow">/ projects / {project.name}</div>
          <h1 className="page-title">{project.name}</h1>
          <p className="page-subtitle">{project.summary || project.fullName}</p>
        </div>
        <StatusBadge status={statusTone[project.status]} label={project.status} />
      </header>

      <Navigation />
      <Link to="/#projects" className="back-link">프로젝트 목록으로</Link>

      <article className="project-detail-card">
        <div className="project-detail-head">
          <div>
            <p className="mono faint">{formatDate(project.createdAt)} · {project.fullName}</p>
            <h2>{project.name}</h2>
          </div>
          <div className="project-actions">
            {project.homepageUrl ? (
              <a className="hero-cta" href={project.homepageUrl} target="_blank" rel="noreferrer">Live</a>
            ) : null}
            <a className="hero-cta" href={project.repoUrl} target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>

        {project.tags.length ? (
          <div className="chip-row">
            {project.tags.map((tag) => (
              <span key={tag} className="chip">{tag}</span>
            ))}
          </div>
        ) : null}

        <div
          className="markdown-body"
          dangerouslySetInnerHTML={{ __html: project.readmeHtml || fallbackReadme(project) }}
        />
      </article>
    </>
  );
}

function formatDate(value: string | null) {
  if (!value) return "date unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "date unknown";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function fallbackReadme(project: Project) {
  return `<h2>${escapeHtml(project.name)}</h2><p>${escapeHtml(project.summary || "README가 아직 없습니다.")}</p>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
