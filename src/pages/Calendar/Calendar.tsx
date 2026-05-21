import { useEffect, useMemo, useState } from "react";
import Navigation from "../../components/Navigation/Navigation";
import { events as ALL_EVENTS, type Event, type EventKind } from "../../data/events";

/* ─────────────────────────────────────────────────────────────
 * Calendar — 월간 grid + agenda 토글 + 날짜 클릭 시 split-view
 * detail 패널 + 이벤트 클릭 시 modal.
 *
 * hompage 의 design token (--accent / --bg-card / --border ...)
 * 위에서 동작. 추가 색은 layout.css 의 .cal-* 클래스에서 정의.
 * ───────────────────────────────────────────────────────────── */

const TODAY = new Date();
const WEEKDAYS_SUN = ["일", "월", "화", "수", "목", "금", "토"];
const KO_DOW = ["일", "월", "화", "수", "목", "금", "토"];
const TYPE_LABEL: Record<EventKind, string> = {
  ship: "ship",
  stream: "stream",
  talk: "talk",
  maintenance: "maintenance",
  personal: "personal",
};

type View = "month" | "agenda";

/* ── date helpers ─────────────────────────────────────────── */
function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function parseYMD(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function addDays(d: Date, n: number) {
  const x = new Date(d); x.setDate(x.getDate() + n); return x;
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function buildMonthGrid(year: number, month: number, weekStart: number) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() - weekStart + 7) % 7;
  const start = addDays(first, -offset);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) cells.push(addDays(start, i));
  while (cells.length > 35 && cells[cells.length - 7].getMonth() !== month) {
    cells.length -= 7;
  }
  return cells;
}
function relativeLabel(d: Date, today: Date) {
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const b = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const days = Math.round((a - b) / 86_400_000);
  if (days === 0) return "today";
  if (days > 0) return `in ${days} day${days > 1 ? "s" : ""}`;
  return `${-days} day${-days > 1 ? "s" : ""} ago`;
}
function shortTitle(ev: Event) {
  const m = ev.title.match(/^[A-Za-z]+ — (.+)$/);
  return m ? m[1] : ev.title;
}

/* ── small components ─────────────────────────────────────── */
function Badge({ type }: { type: EventKind }) {
  return (
    <span className={`cal-badge cal-badge--${type}`}>
      <span className="cal-badge-dot" aria-hidden />
      {TYPE_LABEL[type] ?? type}
    </span>
  );
}

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ── main ─────────────────────────────────────────────────── */
export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [selected, setSelected] = useState<Date>(TODAY);
  const [panelOpen, setPanelOpen] = useState(false);
  const [view, setView] = useState<View>("month");
  const [openEvent, setOpenEvent] = useState<Event | null>(null);
  const weekStart = 0; // 일요일 시작

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = useMemo(() => buildMonthGrid(year, month, weekStart), [year, month]);
  const weekdays = useMemo(() => {
    const arr: string[] = [];
    for (let i = 0; i < 7; i++) arr.push(WEEKDAYS_SUN[(weekStart + i) % 7]);
    return arr;
  }, []);
  const eventsByDate = useMemo(() => {
    const m = new Map<string, Event[]>();
    for (const ev of ALL_EVENTS) {
      if (!m.has(ev.date)) m.set(ev.date, []);
      m.get(ev.date)!.push(ev);
    }
    return m;
  }, []);

  const selectedEvents = eventsByDate.get(ymd(selected)) ?? [];
  const upcomingSorted = useMemo(
    () => [...ALL_EVENTS].sort((a, b) => a.date.localeCompare(b.date)),
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (openEvent) setOpenEvent(null);
        else if (panelOpen) setPanelOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openEvent, panelOpen]);

  function onCellClick(d: Date) {
    if (panelOpen && sameDay(d, selected)) {
      setPanelOpen(false);
      return;
    }
    setSelected(d);
    setPanelOpen(true);
  }

  function goToday() {
    setCursor(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
    setSelected(TODAY);
  }

  return (
    <div className="calendar-shell">
      <header className="page-header">
        <div>
          <div className="page-eyebrow">/ calendar</div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">예정된 ship / talk / stream / 점검.</p>
        </div>
        <span className="chip mono">{ALL_EVENTS.length}</span>
      </header>

      <Navigation />

      {/* toolbar */}
      <div className="cal-toolbar">
        <div className="cal-month-nav">
          <button
            type="button"
            className="cal-icon-btn"
            onClick={() => setCursor(addMonths(cursor, -1))}
            aria-label="이전 달"
          >
            <ChevronLeft />
          </button>
          <div className="cal-month-label">
            <span className="cal-month-year">{year}.</span>
            {String(month + 1).padStart(2, "0")}
          </div>
          <button
            type="button"
            className="cal-icon-btn"
            onClick={() => setCursor(addMonths(cursor, 1))}
            aria-label="다음 달"
          >
            <ChevronRight />
          </button>
        </div>
        <div className="cal-toolbar-right">
          <button type="button" className="cal-today-btn" onClick={goToday}>오늘</button>
          <div className="cal-view-toggle">
            <button
              type="button"
              className={view === "month" ? "on" : ""}
              onClick={() => setView("month")}
            >
              Month
            </button>
            <button
              type="button"
              className={view === "agenda" ? "on" : ""}
              onClick={() => setView("agenda")}
            >
              Agenda
            </button>
          </div>
        </div>
      </div>

      {view === "month" && (
        <div className={panelOpen ? "cal-split" : undefined}>
          <div className="cal-legend">
            {(["ship", "stream", "talk", "maintenance"] as const).map((k) => (
              <span key={k} className="cal-legend-item">
                <span className={`cal-legend-swatch cal-legend-swatch--${k}`} aria-hidden />
                {k}
              </span>
            ))}
            <span className="cal-legend-hint">날짜 클릭 → 상세 패널</span>
          </div>

          <div className="cal-month-card">
            <div className="cal-weekdays">
              {weekdays.map((w, i) => {
                const dow = (weekStart + i) % 7;
                const cls = dow === 0 ? "sun" : dow === 6 ? "sat" : "";
                return (
                  <div key={w + i} className={`cal-weekday ${cls}`}>{w}</div>
                );
              })}
            </div>
            <div className="cal-grid">
              {cells.map((d, idx) => {
                const inMonth = d.getMonth() === month;
                const isToday = sameDay(d, TODAY);
                const isSelected = sameDay(d, selected);
                const dow = d.getDay();
                const dayEvents = eventsByDate.get(ymd(d)) ?? [];
                const cls = [
                  "cal-cell",
                  inMonth ? "" : "out",
                  isToday ? "today" : "",
                  isSelected ? "selected" : "",
                  dow === 0 ? "sun" : dow === 6 ? "sat" : "",
                ].filter(Boolean).join(" ");
                return (
                  <button
                    key={idx}
                    type="button"
                    className={cls}
                    onClick={() => onCellClick(d)}
                  >
                    <span className="cal-daynum-wrap">
                      <span className="cal-daynum">{d.getDate()}</span>
                    </span>
                    {dayEvents.length > 0 && (
                      panelOpen ? (
                        <div className="cal-dots">
                          {dayEvents.map((ev, i) => (
                            <span key={i} className={`cal-dot cal-dot--${ev.kind}`} aria-hidden />
                          ))}
                        </div>
                      ) : (
                        <div className="cal-markers">
                          {dayEvents.map((ev, i) => (
                            <span key={i} className={`cal-marker cal-marker--${ev.kind}`}>
                              <span className="cal-marker-dot" aria-hidden />
                              <span className="cal-marker-text">{shortTitle(ev)}</span>
                            </span>
                          ))}
                        </div>
                      )
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {panelOpen && (
            <DetailPanel
              date={selected}
              events={selectedEvents}
              today={TODAY}
              onOpenEvent={setOpenEvent}
              onClose={() => setPanelOpen(false)}
            />
          )}
        </div>
      )}

      {view === "agenda" && (
        <div className="cal-agenda">
          {upcomingSorted.map((ev) => {
            const d = parseYMD(ev.date);
            return (
              <button
                key={ev.date + ev.title}
                type="button"
                className="cal-agenda-card"
                onClick={() => {
                  setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
                  setSelected(d);
                  setView("month");
                  setPanelOpen(true);
                  setOpenEvent(ev);
                }}
              >
                <div className="cal-agenda-left">
                  <div className="cal-agenda-date">
                    <span>{ev.date.replace(/-/g, "–")}</span>
                    <span className="cal-sep">·</span>
                    <span className="cal-agenda-dow">{KO_DOW[d.getDay()]}요일</span>
                    {ev.time ? (
                      <>
                        <span className="cal-sep">·</span>
                        <span>{ev.time}</span>
                      </>
                    ) : null}
                  </div>
                  <div className="cal-agenda-title">{ev.title}</div>
                  {ev.note ? <div className="cal-event-meta">{ev.note}</div> : null}
                </div>
                <Badge type={ev.kind} />
              </button>
            );
          })}
        </div>
      )}

      {openEvent && (
        <EventModal event={openEvent} onClose={() => setOpenEvent(null)} />
      )}
    </div>
  );
}

/* ── DetailPanel ──────────────────────────────────────────── */
function DetailPanel({
  date, events, today, onOpenEvent, onClose,
}: {
  date: Date;
  events: Event[];
  today: Date;
  onOpenEvent: (e: Event) => void;
  onClose: () => void;
}) {
  const dow = date.getDay();
  const numCls = dow === 0 ? "sun" : dow === 6 ? "sat" : "";
  const isToday = sameDay(date, today);
  const dateStr = `${date.getFullYear()} . ${String(date.getMonth() + 1).padStart(2, "0")} . ${String(date.getDate()).padStart(2, "0")}`;

  return (
    <div className="cal-detail">
      <button type="button" className="cal-detail-close" onClick={onClose} aria-label="닫기">
        <CloseIcon />
      </button>
      <div className="cal-detail-head">
        <div className="cal-detail-date">
          <span className={`cal-detail-num ${numCls}`}>{date.getDate()}</span>
          <div className="cal-detail-meta">
            <div className="cal-detail-meta-line">
              <span className="cal-detail-meta-strong">{KO_DOW[dow]}요일</span> · {dateStr}
            </div>
            <div className="cal-detail-meta-rel">{isToday ? "today" : relativeLabel(date, today)}</div>
          </div>
        </div>
        <div className="cal-detail-count">
          {events.length > 0 ? (
            <>
              <strong>{events.length}</strong> event{events.length > 1 ? "s" : ""} scheduled
            </>
          ) : (
            <>no events</>
          )}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="cal-empty">
          <div className="cal-empty-mark">— EMPTY —</div>
          <div className="cal-empty-title">이 날짜에는 예정된 일정이 없습니다.</div>
          <div className="cal-empty-hint">다른 날짜를 선택해 보세요.</div>
        </div>
      ) : (
        <div className="cal-events">
          {events.map((ev, i) => (
            <button
              key={i}
              type="button"
              className="cal-event-row"
              onClick={() => onOpenEvent(ev)}
            >
              <div className="cal-event-time">
                {ev.time ? (
                  <>
                    <span className="cal-event-time-t">{ev.time}</span>
                    {ev.duration ? <span>+ {ev.duration}</span> : null}
                  </>
                ) : (
                  <span className="cal-event-time-allday">all-day</span>
                )}
              </div>
              <div className="cal-event-body">
                <div className="cal-event-title">{ev.title}</div>
                <div className="cal-event-meta">
                  {ev.meta ? <span>{ev.meta}</span> : null}
                  {ev.meta && ev.note ? <span className="cal-sep">·</span> : null}
                  {ev.note ? <span>{ev.note}</span> : null}
                </div>
              </div>
              <Badge type={ev.kind} />
              <span className="cal-chev" aria-hidden>
                <ChevronRight />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── EventModal ───────────────────────────────────────────── */
function EventModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const d = parseYMD(event.date);
  const dow = KO_DOW[d.getDay()];
  const dateLabel = `${event.date.replace(/-/g, " . ")} (${dow})`;
  const eyebrow = event.kind === "ship" ? "/ EVENT · RELEASE"
    : event.kind === "stream" ? "/ EVENT · STREAM"
    : event.kind === "talk" ? "/ EVENT · TALK"
    : event.kind === "maintenance" ? "/ EVENT · MAINTENANCE"
    : "/ EVENT";

  function onBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="cal-modal-backdrop" onClick={onBackdrop}>
      <div className="cal-modal" role="dialog" aria-modal="true">
        <div className="cal-modal-head">
          <div className="cal-modal-eyebrow">{eyebrow}</div>
          <button type="button" className="cal-modal-close" onClick={onClose} aria-label="닫기">
            <CloseIcon />
          </button>
        </div>

        <div className="cal-modal-body">
          <div className="cal-modal-title-row">
            <Badge type={event.kind} />
            <div className="cal-modal-title">{event.title}</div>
          </div>

          <div className="cal-field-list">
            <div className="cal-field">
              <div className="cal-field-label">DATE</div>
              <div className="cal-field-value mono">{dateLabel}</div>
            </div>

            <div className="cal-field">
              <div className="cal-field-label">TIME</div>
              <div className="cal-field-value">
                {event.time ? (
                  <div className="cal-time-range">
                    <div className="cal-time-block">
                      <span className="cal-time-day">시작</span>
                      <span className="cal-time-clock">{event.time}</span>
                    </div>
                    <span className="cal-time-arrow">→</span>
                    <div className="cal-time-block">
                      <span className="cal-time-day">길이</span>
                      <span className="cal-time-clock cal-time-clock--muted">
                        {event.duration ?? "—"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="mono">all-day</span>
                )}
              </div>
            </div>

            {event.meta ? (
              <div className="cal-field">
                <div className="cal-field-label">WHERE</div>
                <div className="cal-field-value mono cal-field-value--muted">{event.meta}</div>
              </div>
            ) : null}

            {event.note ? (
              <div className="cal-field">
                <div className="cal-field-label">NOTES</div>
                <div className="cal-field-value cal-field-note">{event.note}</div>
              </div>
            ) : null}

            <div className="cal-field">
              <div className="cal-field-label">ALERT</div>
              <div className="cal-field-value">
                <span className="cal-alert-chip">10분 전 팝업</span>
              </div>
            </div>
          </div>
        </div>

        <div className="cal-modal-actions">
          <button type="button" className="cal-modal-btn cal-modal-btn--primary">
            캘린더에 추가
          </button>
          {event.link ? (
            <a
              className="cal-modal-btn"
              href={event.link}
              target="_blank"
              rel="noreferrer"
            >
              열기 ↗
            </a>
          ) : null}
          <button
            type="button"
            className="cal-modal-btn cal-modal-btn--last"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
