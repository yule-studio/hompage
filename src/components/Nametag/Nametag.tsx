import { useRef, useState } from "react";
import { profile } from "../../data/profile";
import "./Nametag.css";

/**
 * Nametag — a hanging ID badge on a lanyard (our dark + green theme).
 *
 * Idle: gentle pendulum sway. Drag it and it swings with your pointer;
 * release and it springs back with a little overshoot. A lightweight
 * CSS/pointer take on portofoliov1's 3D physics lanyard — no 3D deps.
 */
export function Nametag() {
  const [angle, setAngle] = useState<number | null>(null); // null → idle sway
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const releaseTimer = useRef<number | null>(null);

  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    if (releaseTimer.current !== null) window.clearTimeout(releaseTimer.current);
    startX.current = e.clientX;
    setDragging(true);
    setAngle(0);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const next = Math.max(-32, Math.min(32, (e.clientX - startX.current) * 0.12));
    setAngle(next);
  };
  const onUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
    setAngle(0); // spring back (transition handled in CSS)
    releaseTimer.current = window.setTimeout(() => setAngle(null), 1300); // resume idle
  };

  const idle = angle === null;

  return (
    <div className="nametag" aria-hidden>
      <div className="nametag-pin" />
      <div
        className={`nametag-hang${idle ? " is-idle" : ""}${dragging ? " is-dragging" : ""}`}
        style={
          idle
            ? undefined
            : {
                transform: `rotate(${angle}deg)`,
                transition: dragging ? "none" : "transform 1.3s cubic-bezier(0.34, 1.56, 0.5, 1)",
              }
        }
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div className="nametag-lanyard" aria-hidden>
          <span className="nametag-lanyard-text">YUCHAN LAB</span>
          <span className="nametag-lanyard-text">HOME · LAB</span>
          <span className="nametag-clasp" />
        </div>

        <div className="nametag-card">
          <span className="nametag-hole" />
          <div className="nametag-head">
            <span className="mono">HOME-LAB-01</span>
            <span className="nametag-live">
              <i />LIVE
            </span>
          </div>

          <img
            className="nametag-avatar"
            src={profile.avatarUrl}
            alt=""
            draggable={false}
          />

          <div className="nametag-name">{profile.name}</div>
          <a
            className="nametag-handle mono"
            href={profile.links.github}
            target="_blank"
            rel="noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <GhMark /> {profile.githubUsername}
          </a>
          <div className="nametag-role">Backend · DevOps</div>

          <div className="nametag-foot">
            <span className="nametag-access mono">
              ACCESS <b className="accent">GRANTED</b>
            </span>
            <span className="nametag-barcode" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Nametag;

function GhMark() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48 0-.24-.01-.86-.01-1.69-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.12-1.47-1.12-1.47-.92-.62.07-.61.07-.61 1.01.07 1.55 1.04 1.55 1.04.9 1.54 2.36 1.1 2.94.84.09-.66.35-1.1.64-1.36-2.22-.25-4.55-1.11-4.55-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.86 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}
