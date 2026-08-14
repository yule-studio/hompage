import Card from "../../components/Card/Card";
import SectionHeader from "../../components/SectionHeader/SectionHeader";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { hosts, services } from "../../data/homelab";

export default function Homelab() {
  const total = hosts.length;
  const ok = hosts.filter((h) => h.status === "ok").length;

  return (
    <>
      <header className="showcase-head">
        <span className="showcase-eyebrow mono">// HOMELAB</span>
        <h2 className="showcase-title">Homelab</h2>
        <p className="showcase-sub">self-host 인프라 상태 — Proxmox / k3s / 기타.</p>
        <StatusBadge status={ok === total ? "ok" : "warn"} label={`${ok}/${total} healthy`} />
      </header>

      <SectionHeader title="Hosts" meta={`${hosts.length} nodes`} />
      <div className="section-grid">
        {hosts.map((h) => (
          <Card key={h.name} hoverable ariaLabel={`host ${h.name}`}>
            <div className="card-head">
              <h3 className="card-title mono">{h.name}</h3>
              <StatusBadge status={h.status} label={h.status === "ok" ? "healthy" : h.status} />
            </div>
            <p className="card-sub">{h.role}</p>
            <div className="card-body" style={{ gap: 8 }}>
              <div>
                <div className="kpi-label" style={{ marginBottom: 4 }}>cpu {h.cpu}%</div>
                <div className="bar"><span style={{ width: `${h.cpu}%` }} /></div>
              </div>
              <div>
                <div className="kpi-label" style={{ marginBottom: 4 }}>mem {h.mem}%</div>
                <div className="bar"><span style={{ width: `${h.mem}%` }} /></div>
              </div>
            </div>
            <div className="card-footer">
              <span className="mono faint">uptime {h.uptime}</span>
            </div>
          </Card>
        ))}
      </div>

      <SectionHeader title="Services" meta={`${services.length} deployed`} />
      <div className="section-grid">
        {services.map((s) => (
          <Card key={s.name} ariaLabel={`service ${s.name}`}>
            <div className="card-head">
              <h3 className="card-title">{s.name}</h3>
              <StatusBadge status={s.status} label={s.status === "ok" ? "ok" : s.status} />
            </div>
            <p className="card-sub mono">on {s.host}</p>
            <div className="card-footer">
              {s.url ? (
                <a className="card-link" href={s.url} target="_blank" rel="noreferrer">
                  open
                </a>
              ) : (
                <span className="mono faint">internal only</span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
