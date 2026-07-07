import { useEffect, useRef, useState } from "react";
import { profile } from "../../data/profile";
import "./Intro.css";

type IntroProps = {
  /** exit wipe 가 끝나 hero 를 드러낼 준비가 되면 호출된다. */
  onComplete?: () => void;
};

const HOLD_MS = 3000; // entrance cascade 후 유지
const WIPE_MS = 1000; // slide-up wipe

/**
 * Intro — 첫 진입 오버레이 (portofoliov1 WelcomeScreen 의 느낌을 우리 테마로).
 *
 * 검은(우리 --bg) 풀뷰포트 → 배지 아이콘 stagger 등장 → "WELCOME TO / YUCHAN LAB"
 * 슬라이드 인 → 잠깐 유지 → 위로 slide-up wipe 하며 hero 를 드러낸다.
 * 색은 전부 tokens.css(다크 + 초록 accent) 사용.
 */
export function Intro({ onComplete }: IntroProps) {
  const [exiting, setExiting] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setExiting(true), HOLD_MS);
    const t2 = window.setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onComplete?.();
      }
    }, HOLD_MS + WIPE_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [onComplete]);

  return (
    <div className={`intro${exiting ? " is-exiting" : ""}`} aria-hidden>
      <div className="intro-inner">
        <div className="intro-badges">
          {[<CodeGlyph key="c" />, <TerminalGlyph key="t" />, <GlobeGlyph key="g" />].map(
            (glyph, i) => (
              <span className="intro-badge" style={{ "--i": i } as React.CSSProperties} key={i}>
                {glyph}
              </span>
            ),
          )}
        </div>

        <div className="intro-text">
          <h2 className="intro-welcome-line">
            <span className="intro-word intro-word--r">Welcome</span>
            <span className="intro-word intro-word--l">to my</span>
          </h2>
          <h1 className="intro-brand">
            <span className="intro-word intro-word--l">Yule</span>
            <span className="intro-word intro-word--r">Studio</span>
            <span className="intro-word intro-word--l accent">Lab</span>
          </h1>
        </div>

        <span className="intro-capsule mono">
          {profile.handle} · home-lab-01
        </span>
      </div>
    </div>
  );
}

export default Intro;

function CodeGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 6l-5 6 5 6M16 6l5 6-5 6" />
    </svg>
  );
}
function TerminalGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 9l3 3-3 3M13 15h4" />
    </svg>
  );
}
function GlobeGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
    </svg>
  );
}
