import Card from "../../components/Card/Card";
import Navigation from "../../components/Navigation/Navigation";
import SectionHeader from "../../components/SectionHeader/SectionHeader";
import { skills } from "../../data/skills";

export default function Skills() {
  return (
    <>
      <header className="page-header">
        <div>
          <div className="page-eyebrow">/ skills</div>
          <h1 className="page-title">Skills</h1>
          <p className="page-subtitle">현재 자주 쓰는 스택. 숫자는 자기 평가 — 면접용 아님.</p>
        </div>
      </header>

      <Navigation />

      {skills.map((group) => (
        <section key={group.group}>
          <SectionHeader title={group.group} meta={`${group.items.length} items`} />
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
