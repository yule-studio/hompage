import Card from "../../components/Card/Card";
import Navigation from "../../components/Navigation/Navigation";
import SectionHeader from "../../components/SectionHeader/SectionHeader";
import { skills } from "../../data/skills";
import { useGithubLanguages } from "../../hooks/useGithubLanguages";
import { formatBytes } from "../../data/githubLanguages";

/**
 * Skills — first group (Languages) is dynamic, derived from GitHub repo
 * language bytes (see scripts/fetch-github-languages.mjs). The remaining
 * groups (Backend / DevOps / AI) stay self-rated in data/skills.ts since
 * GitHub doesn't surface framework-level usage data.
 */
export default function Skills() {
  const langPayload = useGithubLanguages();
  const selfRatedGroups = skills.filter((g) => g.group.toLowerCase() !== "languages");
  const dynamicMeta = langPayload.totalBytes > 0
    ? `${langPayload.languages.length} langs · ${langPayload.reposScanned} repos · ${formatBytes(langPayload.totalBytes)}`
    : langPayload.isLoading ? "loading…" : "no data";

  return (
    <>
      <header className="page-header">
        <div>
          <div className="page-eyebrow">/ skills</div>
          <h1 className="page-title">Skills</h1>
          <p className="page-subtitle">
            Languages 비중은 GitHub 의 실제 코드 바이트 합산 — 자기 평가가 아님.
            다른 그룹은 자기 평가 (면접용 아님).
          </p>
        </div>
      </header>

      <Navigation />

      {/* Languages — dynamic from GitHub */}
      <section>
        <SectionHeader title="Languages" meta={dynamicMeta} />
        <div className="section-grid">
          {langPayload.languages.length === 0 ? (
            <Card ariaLabel="languages empty">
              <p className="card-sub">
                {langPayload.isLoading
                  ? "GitHub 언어 통계 가져오는 중…"
                  : "github-languages.json 이 아직 없음. `npm run github:languages` 로 생성."}
              </p>
            </Card>
          ) : (
            langPayload.languages.map((lang) => (
              <Card key={lang.name} ariaLabel={`language ${lang.name}`}>
                <div className="card-head">
                  <h3 className="card-title">
                    <span
                      className="lang-dot"
                      aria-hidden
                      style={{ background: lang.color ?? "var(--text-muted)" }}
                    />
                    {lang.name}
                  </h3>
                  <span className="mono faint">{lang.percent.toFixed(1)}%</span>
                </div>
                <div className="bar" aria-hidden>
                  <span
                    style={{
                      width: `${Math.min(100, lang.percent)}%`,
                      background: lang.color ?? "var(--accent)",
                    }}
                  />
                </div>
                <p className="card-sub mono faint">
                  {lang.repos} repos · {formatBytes(lang.bytes)}
                </p>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Backend / DevOps / AI — self-rated, hardcoded */}
      {selfRatedGroups.map((group) => (
        <section key={group.group}>
          <SectionHeader title={group.group} meta={`${group.items.length} items · self-rated`} />
          <div className="section-grid">
            {group.items.map((s) => (
              <Card key={s.name} ariaLabel={`skill ${s.name}`}>
                <div className="card-head">
                  <h3 className="card-title">{s.name}</h3>
                  <span className="mono faint">{s.level}</span>
                </div>
                <div className="bar" aria-hidden>
                  <span style={{ width: `${s.level}%` }} />
                </div>
                {s.note ? <p className="card-sub">{s.note}</p> : null}
              </Card>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
