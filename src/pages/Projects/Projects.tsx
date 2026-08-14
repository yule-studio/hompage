import { Link } from "react-router-dom";
import { type Project } from "../../data/projects";
import { useProjects } from "../../hooks/useProjects";
import "./Projects.css";

/**
 * Projects — a "Lab Archive / Case File" view of the GitHub repos, tuned to
 * carry the hero's engineering-lab / ID-card language (dark grid, green accent,
 * LIVE·ACCESS·serial marks). A Featured case file leads, then the rest stack as
 * compact case cards. Display-only: the underlying Project data is unchanged;
 * ROLE / STACK / SCOPE are derived for presentation.
 */

const PREFERRED_FEATURED = ["yule-studio-agent", "yule-agent-vault", "hompage"];

type StatusTone = "live" | "active" | "shipped" | "paused" | "archived";

function statusOf(p: Project): { label: string; tone: StatusTone } {
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

// display-only role inference from language / repo signals (data has no role)
function roleOf(p: Project): string {
  const lang = (p.language || "").toLowerCase();
  const hay = `${p.name} ${p.slug} ${p.tags.join(" ")} ${p.summary}`.toLowerCase();
  if (/agent|vault|orchestr/.test(hay)) return "R&D · Agent";
  if (/front/.test(hay)) return "Frontend";
  if (/homelab|cloud|infra|k3s/.test(hay)) return "Infra · DevOps";
  if (/algorithm/.test(hay)) return "CS · Practice";
  if (lang === "go") return "Systems · Backend";
  if (lang === "java") return "Backend";
  if (lang === "python") return "Backend · Agent";
  if (lang === "typescript" || lang === "javascript") return "Full-stack";
  return "Engineering";
}

function stackOf(p: Project): string[] {
  const base = [...new Set([p.language, ...p.tags].filter(Boolean) as string[])];
  if (base.length) return base;
  const hay = `${p.name} ${p.slug} ${p.summary}`.toLowerCase();
  const g: string[] = [];
  if (/spring/.test(hay)) g.push("Spring");
  if (/jsp/.test(hay)) g.push("JSP");
  if (/kafka|redis|k3s|batch/.test(hay)) g.push("Infra");
  if (/aws|azure|oci|cloud/.test(hay)) g.push("Cloud");
  if (/\bgo\b|utility-box/.test(hay)) g.push("Go");
  if (/algorithm/.test(hay)) g.push("Algorithms");
  return g.length ? g : ["Mixed"];
}

function scopeOf(p: Project): string {
  const owner = (p.fullName.split("/")[0] || "").toLowerCase();
  return owner === "yule-studio" ? "Studio" : "Personal";
}

function caseNo(i: number): string {
  return String(i + 1).padStart(2, "0");
}

function summaryOf(p: Project): string {
  return p.summary?.trim() || "케이스 파일 — 열어서 전체 기록 확인.";
}

export default function Projects() {
  const { projects, isLoading } = useProjects();

  if (!projects.length) {
    return (
      <div className="lab-archive">
        <ArchiveHead count={0} />
        <article className="case-file case-file--empty">
          <div className="case-file-top">
            <span className="case-id mono">CASE ··</span>
            <span className={`case-status case-status--${isLoading ? "active" : "paused"}`}>
              <i /> {isLoading ? "SYNCING" : "NO RECORDS"}
            </span>
          </div>
          <p className="case-summary">
            {isLoading
              ? "아카이브에서 케이스 파일을 불러오는 중…"
              : "동기화된 public repo 가 없습니다."}
          </p>
        </article>
      </div>
    );
  }

  const indexed = projects.map((p, i) => ({ p, no: caseNo(i) }));
  // pick the featured file by preference PRIORITY (not repo order), so the
  // flagship leads even when it isn't the first repo.
  const featured =
    PREFERRED_FEATURED.map((slug) => indexed.find((x) => x.p.slug === slug)).find(Boolean) ??
    indexed[0];
  const rest = indexed.filter((x) => x !== featured);

  return (
    <div className="lab-archive">
      <ArchiveHead count={projects.length} />
      <FeaturedCase p={featured.p} no={featured.no} />
      <div className="case-grid">
        {rest.map(({ p, no }) => (
          <CaseCard key={p.slug} p={p} no={no} />
        ))}
      </div>
    </div>
  );
}

function ArchiveHead({ count }: { count: number }) {
  return (
    <header className="archive-head">
      <div className="archive-head-lead">
        <span className="archive-eyebrow mono">// LAB ARCHIVE</span>
        <h2 className="archive-title">Selected Projects</h2>
        <p className="archive-sub">
          엔지니어링 랩의 케이스 파일 — 실험하고 구축하고 정리한 작업 기록.
        </p>
      </div>
      <div className="archive-status mono" aria-hidden>
        <span className="archive-status-line">
          <i className="archive-dot" /> ARCHIVE ONLINE
        </span>
        <span className="archive-count">{String(count).padStart(2, "0")} CASE FILES</span>
      </div>
    </header>
  );
}

function FeaturedCase({ p, no }: { p: Project; no: string }) {
  const st = statusOf(p);
  return (
    <article className="case-file case-file--featured">
      <div className="case-file-top">
        <span className="case-id mono">CASE {no}</span>
        <span className="case-flag mono">★ FEATURED FILE</span>
        <span className={`case-status case-status--${st.tone}`}>
          <i /> {st.label}
        </span>
      </div>

      <div className="case-featured-body">
        <div className="case-featured-lead">
          <h3 className="case-name">
            <Link to={`/projects/${p.slug}`}>{p.name}</Link>
          </h3>
          <div className="case-fullname mono">{p.fullName}</div>
          <p className="case-summary">{summaryOf(p)}</p>
        </div>

        <dl className="case-meta">
          <div>
            <dt>ROLE</dt>
            <dd>{roleOf(p)}</dd>
          </div>
          <div>
            <dt>STACK</dt>
            <dd>{stackOf(p).join(" · ")}</dd>
          </div>
          <div>
            <dt>SCOPE</dt>
            <dd>{scopeOf(p)}</dd>
          </div>
          <div>
            <dt>YEAR</dt>
            <dd className="mono">{p.year}</dd>
          </div>
        </dl>
      </div>

      <div className="case-file-foot">
        <Link className="case-open" to={`/projects/${p.slug}`}>
          OPEN CASE FILE →
        </Link>
        <span className="case-serial mono" aria-hidden>
          <span className="case-barcode" /> SN·YS-{p.year}-{no}
        </span>
      </div>
    </article>
  );
}

function CaseCard({ p, no }: { p: Project; no: string }) {
  const st = statusOf(p);
  return (
    <article className="case-file">
      <div className="case-file-top">
        <span className="case-id mono">CASE {no}</span>
        <span className={`case-status case-status--${st.tone}`}>
          <i /> {st.label}
        </span>
      </div>

      <h3 className="case-name case-name--sm">
        <Link to={`/projects/${p.slug}`}>{p.name}</Link>
      </h3>
      <p className="case-summary case-summary--clamp">{summaryOf(p)}</p>

      <div className="case-chips">
        {stackOf(p)
          .slice(0, 4)
          .map((s) => (
            <span key={s} className="case-chip mono">
              {s}
            </span>
          ))}
        <span className="case-scope mono">{scopeOf(p)}</span>
      </div>

      <div className="case-file-foot">
        <Link className="case-open case-open--sm" to={`/projects/${p.slug}`}>
          OPEN CASE FILE →
        </Link>
        <span className="case-year mono">{p.year}</span>
      </div>
      <span className="case-barcode case-barcode--strip" aria-hidden />
    </article>
  );
}
