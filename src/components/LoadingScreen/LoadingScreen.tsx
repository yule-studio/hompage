import { useEffect, useRef, useState } from "react";
import { profile } from "../../data/profile";
import "./LoadingScreen.css";

type LoadingScreenProps = {
  /** 진행이 100% 에 도달하고 fade-out 이 끝난 뒤 호출된다. */
  onComplete?: () => void;
  /** 0 → 100 까지 걸리는 시간(ms). 기본 2200ms. */
  duration?: number;
};

type Theme = "dark" | "light";

const FADE_MS = 420;

/** index.html 인라인 스크립트가 render 이전에 설정해 둔 테마를 읽는다. */
function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * LoadingScreen — 첫 진입 시 짧게 표시되는 full-viewport intro overlay.
 *
 * - progress 는 requestAnimationFrame + duration 기반으로 0 → 100 계산.
 * - cat wheel 은 2x4 sprite sheet 를 CSS steps 애니메이션으로 한 프레임씩 전환.
 * - 색은 tokens.css 의 CSS variable 을 사용. 단 sprite 패널만 흰색 애셋
 *   가시성을 위해 항상 dark 로 유지한다(라이트 테마에서도).
 */
export function LoadingScreen({ onComplete, duration = 2200 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const theme = readTheme();
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      setProgress(Math.round(easeOutCubic(t) * 100));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setExiting(true);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [duration]);

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
          THEME: {theme.toUpperCase()} <span className="loading-sep">|</span> SYSTEM:{" "}
          <span className="accent">ONLINE</span>
        </span>
      </header>

      {/* center — cat wheel + progress */}
      <div className="loading-center">
        <div className="loading-cat" aria-hidden>
          <div className="loading-cat-sprite" />
        </div>

        <div className="loading-percent mono">{progress}%</div>

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
