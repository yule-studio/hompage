import { useEffect, useRef } from "react";
import { profile } from "../../data/profile";
import "./Nametag.css";

// damped-pendulum constants — lower DAMPING = more springy bounce
const STIFFNESS = 62; // restoring pull toward rest (snappiness)
const DAMPING = 3.1; // energy loss per swing (bounciness)
const DRAG_FACTOR = 0.16; // px of drag → deg of tilt
const MAX_ANGLE = 44;
const IDLE_AMP = 1.6; // gentle idle sway amplitude (deg)
const IDLE_FREQ = 1.1; // idle sway speed

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/**
 * Nametag — a hanging ID badge on a lanyard (our dark + green theme).
 *
 * A real damped-pendulum simulation (requestAnimationFrame): idle it sways
 * gently, drag it and it follows your pointer, release and it swings back and
 * forth with decaying bounce — like a real lanyard. A lightweight 2D take on
 * portofoliov1's 3D physics lanyard, no 3D deps.
 */
export function Nametag() {
  const hangRef = useRef<HTMLDivElement>(null);
  const phys = useRef({ angle: 0, vel: 0, dragging: false, startX: 0, grabAngle: 0, lastT: 0 });

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const idleAmp = reduce ? 0 : IDLE_AMP;

    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const s = phys.current;
      const dt = Math.min(0.033, (now - prev) / 1000);
      prev = now;
      if (!s.dragging) {
        const rest = idleAmp * Math.sin((now / 1000) * IDLE_FREQ);
        const acc = -STIFFNESS * (s.angle - rest) - DAMPING * s.vel;
        s.vel += acc * dt;
        s.angle += s.vel * dt;
      }
      if (hangRef.current) hangRef.current.style.transform = `rotate(${s.angle.toFixed(3)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const s = phys.current;
    s.dragging = true;
    s.startX = e.clientX;
    s.grabAngle = s.angle;
    s.lastT = performance.now();
    s.vel = 0;
  };
  const onMove = (e: React.PointerEvent) => {
    const s = phys.current;
    if (!s.dragging) return;
    const target = clamp(s.grabAngle + (e.clientX - s.startX) * DRAG_FACTOR, -MAX_ANGLE, MAX_ANGLE);
    const now = performance.now();
    const dt = Math.max(0.001, (now - s.lastT) / 1000);
    s.vel = (target - s.angle) / dt; // carry throw velocity into the release
    s.angle = target;
    s.lastT = now;
  };
  const onUp = (e: React.PointerEvent) => {
    const s = phys.current;
    if (!s.dragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    s.dragging = false;
    s.vel = clamp(s.vel, -520, 520); // cap a wild flick
  };

  return (
    <div className="nametag" aria-hidden>
      <div className="nametag-pin" />
      <div
        ref={hangRef}
        className="nametag-hang"
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
