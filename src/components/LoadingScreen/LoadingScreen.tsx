import { useEffect, useRef, useState } from "react";
import { profile } from "../../data/profile";
import "./LoadingScreen.css";

type LoadingScreenProps = {
  /** 진행이 100% 에 도달하고 fade-out 이 끝난 뒤 호출된다. */
  onComplete?: () => void;
};

/*
 * Method B 타이밍 — 레퍼런스처럼 95~100% 구간에 체류감을 준다.
 *   0 → 95%   : PHASE1_MS 동안 easeOut (초반 빠르게, 95 근처에서 감속)
 *   95 → 100% : PHASE2_MS 동안 linear (느리게 마무리)
 *   100%      : HOLD_MS 동안 유지 후 fade-out 시작
 *   fade-out  : FADE_MS
 * 100% 도달까지 ≈ 3500ms, unmount 까지 ≈ 4220ms (< 5s).
 */
const PHASE1_MS = 2800;
const PHASE1_TO = 95;
const PHASE2_MS = 700;
const HOLD_MS = 300;
const FADE_MS = 420;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * LoadingScreen — 첫 진입 시 짧게 표시되는 full-viewport intro overlay (dark-only).
 *
 * - progress 는 requestAnimationFrame + 2-phase 곡선으로 0 → 95 → 100 계산.
 * - cat wheel 은 2x4 sprite sheet 를 CSS steps 애니메이션으로 한 프레임씩 전환.
 * - 색은 tokens.css 의 CSS variable(dark) 사용.
 */
export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const holdRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;

      let p: number;
      if (elapsed < PHASE1_MS) {
        p = easeOutCubic(elapsed / PHASE1_MS) * PHASE1_TO;
      } else if (elapsed < PHASE1_MS + PHASE2_MS) {
        p = PHASE1_TO + ((elapsed - PHASE1_MS) / PHASE2_MS) * (100 - PHASE1_TO);
      } else {
        p = 100;
      }
      setProgress(Math.min(100, Math.floor(p)));

      if (elapsed < PHASE1_MS + PHASE2_MS) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // 100% 를 잠깐 감상할 수 있도록 HOLD 후 fade-out 시작
        holdRef.current = window.setTimeout(() => setExiting(true), HOLD_MS);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (holdRef.current !== null) window.clearTimeout(holdRef.current);
    };
  }, []);

  // fade-out 이 끝나면 부모에게 완료를 알린다.
  useEffect(() => {
    if (!exiting) return;
    const id = window.setTimeout(() => onComplete?.(), FADE_MS);
    return () => window.clearTimeout(id);
  }, [exiting, onComplete]);

  return (
    <div
      className={`loading-screen${exiting ? " is-exiting" : ""}`}
      role="progressbar"
      aria-label="Loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      {/* top row — brand / system status */}
      <header className="loading-topbar">
        <span className="loading-brand mono">
          <span className="loading-caret accent">&gt;</span> YUCHAN LAB
        </span>
        <span className="loading-sys label">
          THEME: DARK <span className="loading-sep">|</span> SYSTEM:{" "}
          <span className="accent">ONLINE</span>
        </span>
      </header>

      {/* center — cat wheel + progress */}
      <div className="loading-center">
        <div className="loading-cat" aria-hidden>
          <div className="loading-cat-sprite" />
        </div>

        <div className="loading-percent mono">
          {progress}
          <span className="loading-percent-sign">%</span>
        </div>

        <div className="loading-track" aria-hidden>
          <div className="loading-bar" style={{ width: `${progress}%` }} />
        </div>

        <h1 className="loading-title">
          WELCOME TO THE <span className="accent">LAB</span>
        </h1>
        <p className="loading-subtitle label">Initializing systems…</p>
      </div>

      {/* bottom row — node / dots / uptime */}
      <footer className="loading-bottombar">
        <span className="loading-node label">NODE: HOME-LAB-01</span>
        <span className="loading-dots" aria-hidden>
          <i className="loading-dot" />
          <i className="loading-dot" />
          <i className="loading-dot" />
        </span>
        <span className="loading-uptime label">UPTIME: {profile.uptimeDays}D 14H 07M</span>
      </footer>
    </div>
  );
}

export default LoadingScreen;
