import Card from "../../components/Card/Card";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { events, type Event } from "../../data/events";

const tone: Record<Event["kind"], "ok" | "info" | "warn" | "muted"> = {
  ship: "ok",
  stream: "info",
  talk: "info",
  maintenance: "warn",
  personal: "muted",
};

export default function CalendarPage() {
  return (
    <>
      <header className="page-header">
        <div>
          <div className="page-eyebrow">/ calendar</div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">예정된 ship / talk / stream / 점검.</p>
        </div>
        <span className="chip mono">{events.length}</span>
      </header>

      <div className="section-grid">
        {events.map((e) => (
          <Card key={e.date + e.title} hoverable>
            <div className="card-head">
              <span className="mono">{e.date}{e.time ? ` · ${e.time}` : ""}</span>
              <StatusBadge status={tone[e.kind]} label={e.kind} />
            </div>
            <h3 className="card-title">{e.title}</h3>
            {e.link ? (
              <div className="card-footer">
                <a className="card-link" href={e.link} target="_blank" rel="noreferrer">
                  details
                </a>
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </>
  );
}
