import { useEffect, useRef } from "react";
import { profile } from "../../data/profile";
import "./Nametag.css";

/* ── rope + card geometry ───────────────────────────────────── */
const W = 230; // container width
const ANCHOR_X = W / 2;
const N = 16; // rope points
const ROPE_LEN = 235; // hang length
const SEG = ROPE_LEN / (N - 1);
const CARD_W = 190;
const CARD_H = 232;
const H = ROPE_LEN + CARD_H + 24; // container height

const GRAVITY = 1500; // px/s²
const DAMP = 0.965; // velocity retention (bounciness)
const ITER = 20; // constraint solver passes

// the card has its own rotational spring so it visibly swings/wobbles
const CARD_STIFF = 78;
const CARD_DAMP = 4.4;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

type Pt = { x: number; y: number; ox: number; oy: number };

/**
 * Nametag — a hanging ID badge whose lanyard is a real flexible cord
 * (Verlet-integrated rope). The top point is pinned; the cord bends and
 * swings, dragging the card with it and settling under gravity — a 2D take
 * on portofoliov1's 3D physics lanyard, no 3D deps.
 */
export function Nametag() {
  const containerRef = useRef<HTMLDivElement>(null);
  const ribbonRef = useRef<SVGPathElement>(null);
  const ribbonEdgeRef = useRef<SVGPathElement>(null);
  const textPathRef = useRef<SVGPathElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const state = useRef({
    pts: Array.from({ length: N }, (_, i): Pt => ({ x: ANCHOR_X, y: i * SEG, ox: ANCHOR_X, oy: i * SEG })),
    dragging: false,
    tx: ANCHOR_X,
    ty: ROPE_LEN,
    offX: 0,
    offY: 0,
    cardAngle: 0,
    cardVel: 0,
  });

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const s = state.current;
    let raf = 0;
    let prev = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - prev) / 1000);
      prev = now;
      const pts = s.pts;

      if (!reduce || s.dragging) {
        // Verlet integrate (skip the fixed anchor point 0)
        for (let i = 1; i < N; i++) {
          const p = pts[i];
          const vx = (p.x - p.ox) * DAMP;
          const vy = (p.y - p.oy) * DAMP;
          p.ox = p.x;
          p.oy = p.y;
          p.x += vx;
          p.y += vy + GRAVITY * dt * dt;
        }
        // satisfy distance constraints
        for (let k = 0; k < ITER; k++) {
          pts[0].x = ANCHOR_X;
          pts[0].y = 0;
          if (s.dragging) {
            pts[N - 1].x = s.tx;
            pts[N - 1].y = s.ty;
          }
          for (let i = 0; i < N - 1; i++) {
            const a = pts[i];
            const b = pts[i + 1];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const d = Math.hypot(dx, dy) || 0.0001;
            const diff = ((SEG - d) / d) * 0.5;
            const ox = dx * diff;
            const oy = dy * diff;
            if (i !== 0) { a.x -= ox; a.y -= oy; }
            if (!(s.dragging && i + 1 === N - 1)) { b.x += ox; b.y += oy; }
          }
        }
      }

      // build the cord path
      let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 1; i < N; i++) d += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
      ribbonRef.current?.setAttribute("d", d);
      ribbonEdgeRef.current?.setAttribute("d", d);
      textPathRef.current?.setAttribute("d", d);

      // place the card at the cord's end; its rotation is a spring toward the
      // lower-rope direction with its own momentum, so it swings/wobbles
      const last = pts[N - 1];
      const base = pts[N - 4];
      const targetAng = (Math.atan2(last.x - base.x, last.y - base.y) * 180) / Math.PI;
      if (!reduce || s.dragging) {
        const torque = -CARD_STIFF * (s.cardAngle - targetAng) - CARD_DAMP * s.cardVel;
        s.cardVel += torque * dt;
        s.cardAngle += s.cardVel * dt;
      } else {
        s.cardAngle = targetAng;
      }
      if (cardRef.current) {
        cardRef.current.style.transform =
          `translate(-50%, 0) translate(${(last.x - ANCHOR_X).toFixed(1)}px, ${last.y.toFixed(1)}px) rotate(${s.cardAngle.toFixed(2)}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const toLocal = (e: React.PointerEvent) => {
    const r = containerRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const s = state.current;
    const l = toLocal(e);
    const last = s.pts[N - 1];
    s.offX = last.x - l.x;
    s.offY = last.y - l.y;
    s.tx = last.x;
    s.ty = last.y;
    s.dragging = true;
  };
  const onMove = (e: React.PointerEvent) => {
    const s = state.current;
    if (!s.dragging) return;
    const l = toLocal(e);
    s.tx = clamp(l.x + s.offX, 10, W - 10);
    s.ty = clamp(l.y + s.offY, 30, H);
  };
  const onUp = (e: React.PointerEvent) => {
    if (!state.current.dragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    state.current.dragging = false;
  };

  return (
    <div
      className="nametag"
      style={{ width: W, height: H }}
      ref={containerRef}
      aria-hidden
    >
      <svg className="nametag-rope" width={W} height={H} aria-hidden>
        <path ref={ribbonEdgeRef} className="nametag-ribbon-edge" />
        <path ref={ribbonRef} id="nt-rope-path" className="nametag-ribbon" />
        <defs>
          <path ref={textPathRef} id="nt-text-path" />
        </defs>
        <text className="nametag-ribbon-text">
          <textPath href="#nt-text-path" startOffset="8">
            YUCHAN · LAB · HOME · LAB · YUCHAN · LAB · HOME · LAB · YUCHAN · LAB · HOME · LAB
          </textPath>
        </text>
      </svg>

      <div
        className="nametag-card"
        ref={cardRef}
        style={{ width: CARD_W }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <span className="nametag-clip" />
        <span className="nametag-hole" />
        <div className="nametag-head">
          <span className="mono">HOME-LAB-01</span>
          <span className="nametag-live">
            <i />LIVE
          </span>
        </div>

        <img className="nametag-avatar" src={profile.avatarUrl} alt="" draggable={false} />

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
