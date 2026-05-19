import Card from "../../components/Card/Card";
import Navigation from "../../components/Navigation/Navigation";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { certs, type Cert } from "../../data/certs";

const tone: Record<Cert["status"], "ok" | "info" | "warn"> = {
  active: "ok",
  "in-progress": "info",
  expired: "warn",
};

export default function Certs() {
  return (
    <>
      <header className="page-header">
        <div>
          <div className="page-eyebrow">/ certifications</div>
          <h1 className="page-title">Certs</h1>
          <p className="page-subtitle">자격증 — 학습 가이드의 보조 신호로 사용.</p>
        </div>
        <span className="chip mono">{certs.length}</span>
      </header>

      <Navigation />

      <div className="section-grid">
        {certs.map((c) => (
          <Card key={c.name} hoverable>
            <div className="card-head">
              <h3 className="card-title">{c.name}</h3>
              <StatusBadge status={tone[c.status]} label={c.status} />
            </div>
            <p className="card-sub">{c.issuer}</p>
            <div className="card-footer">
              <span className="mono faint">{c.id ?? "—"}</span>
              <span className="mono faint">{c.year}</span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
