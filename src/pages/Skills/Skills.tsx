import Card from "../../components/Card/Card";
import Navigation from "../../components/Navigation/Navigation";
import SectionHeader from "../../components/SectionHeader/SectionHeader";
import { skills } from "../../data/skills";
import { useGithubLanguages } from "../../hooks/useGithubLanguages";
import { useGithubTopics } from "../../hooks/useGithubTopics";
import { formatBytes } from "../../data/githubLanguages";

/**
 * Skills — fully derived from GitHub when possible.
 *
 * - Languages: byte sum across owned repos (precise).
 * - Backend / DevOps / AI: aggregated `repo.topics` counts mapped to a
 *   small category dictionary in scripts/fetch-github-topics.mjs.
 *
 * If a category has no detected topics (e.g. user hasn't tagged any repos),
 * fall back to the hardcoded self-rated list from data/skills.ts so the page
 * never renders empty.
 */
export default function Skills() {
  const langPayload = useGithubLanguages();
  const topicsPayload = useGithubTopics();

  const langMeta = langPayload.totalBytes > 0
    ? `${langPayload.languages.length} langs · ${langPayload.reposScanned} repos · ${formatBytes(langPayload.totalBytes)}`
    : langPayload.isLoading ? "loading…" : "no data";

  const selfRatedByName = new Map(
    skills.filter((g) => g.group.toLowerCase() !== "languages").map((g) => [normalize(g.group), g]),
  );

  return (
    <>
      <header className="page-header">
        <div>
          <div className="page-eyebrow">/ skills</div>
          <h1 className="page-title">Skills</h1>
          <p className="page-subtitle">
            Languages 비중은 GitHub 의 실제 코드 바이트 합산. <br />
            Backend / DevOps / AI 는 GitHub repo 토픽 누적 — 토픽이 안 달린 카테고리는 자기 평가로 fallback.
          </p>
        </div>
      </header>

      <Navigation />

      {/* Languages — dynamic from GitHub (bytes) */}
      <section>
        <SectionHeader title="Languages" meta={langMeta} />
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
                      width: `${Math.max(1.5, Math.min(100, lang.percent))}%`,
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

      {/* Backend / DevOps / AI — derived from repo topics */}
      {topicsPayload.categories.map((cat) => {
        const fallback = selfRatedByName.get(normalize(cat.name));
        const hasTopics = cat.items.length > 0;
        const meta = hasTopics
          ? `${cat.items.length} topics · ${topicsPayload.reposScanned} repos`
          : fallback ? `${fallback.items.length} items · self-rated fallback` : "no topics";

        return (
          <section key={cat.name}>
            <SectionHeader title={cat.name} meta={meta} />
            <div className="section-grid">
              {hasTopics ? (
                cat.items.map((item) => (
                  <Card key={item.label} ariaLabel={`skill ${item.label}`}>
                    <div className="card-head">
                      <h3 className="card-title">{item.label}</h3>
                      <span className="mono faint">{item.repos} repos</span>
                    </div>
                    <p className="card-sub mono faint">
                      topic: <span className="mono">{item.topic}</span>
                    </p>
                  </Card>
                ))
              ) : fallback ? (
                fallback.items.map((s) => (
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
                ))
              ) : (
                <Card ariaLabel={`${cat.name} empty`}>
                  <p className="card-sub">아직 이 카테고리의 토픽이 달린 repo 가 없음.</p>
                </Card>
              )}
            </div>
          </section>
        );
      })}

      {/* If GitHub topics payload returned no categories at all, render the
          full self-rated list so the page never renders empty. */}
      {topicsPayload.categories.length === 0
        ? skills
            .filter((g) => g.group.toLowerCase() !== "languages")
            .map((group) => (
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
            ))
        : null}
    </>
  );
}

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, "");
}
