import Card from "../../components/Card/Card";
import Navigation from "../../components/Navigation/Navigation";
import { awards } from "../../data/awards";

export default function Awards() {
  return (
    <>
      <header className="page-header">
        <div>
          <div className="page-eyebrow">/ awards</div>
          <h1 className="page-title">Awards</h1>
          <p className="page-subtitle">받은 인정 — 의미 있는 것만.</p>
        </div>
        <span className="chip mono">{awards.length}</span>
      </header>

      <Navigation />

      <div className="section-grid">
        {awards.map((a) => (
          <Card key={`${a.year}-${a.title}`} hoverable>
            <div className="card-head">
              <h3 className="card-title">{a.title}</h3>
              <span className="mono faint">{a.year}</span>
            </div>
            <p className="card-sub">{a.org}</p>
            {a.note ? <p className="muted" style={{ fontSize: "var(--text-sm)" }}>{a.note}</p> : null}
          </Card>
        ))}
      </div>
    </>
  );
}
