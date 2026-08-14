import { useEffect, useRef } from "react";
import "./AnimatedBackground.css";

/**
 * AnimatedBackground — portofoliov1's backdrop in our palette: four heavily
 * blurred blobs drifting on a sine/cosine path driven by scroll position, over
 * a fine line grid. portofoliov1's blobs are white; ours are the green accent
 * and cool neutrals at much lower opacity, so they read as a glow on the
 * near-black surface rather than a wash.
 *
 * Fixed and behind everything, so it stays put while the page scrolls.
 */
export default function AnimatedBackground() {
  const blobs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let queued = false;

    const apply = () => {
      queued = false;
      const scroll = window.scrollY;
      blobs.current.forEach((blob, i) => {
        if (!blob) return;
        const x = Math.sin(scroll / 120 + i * 0.6) * 100;
        const y = Math.cos(scroll / 120 + i * 0.6) * 35;
        blob.style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    // coalesce scroll events into one frame — portofoliov1 re-arms a rAF loop
    // from inside its scroll handler, which stacks a new loop per event
    const onScroll = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="bg-anim" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`bg-blob bg-blob--${i + 1}`}
          ref={(el) => {
            blobs.current[i] = el;
          }}
        />
      ))}
      <div className="bg-grid" />
    </div>
  );
}
