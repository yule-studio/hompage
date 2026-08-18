import { useEffect, useRef } from "react";

/**
 * Plays a muted clip for exactly as long as it is on screen.
 *
 * A demo nobody has to discover is worth more than one that waits for a cursor,
 * and a phone has no cursor to give it — so these autoplay. What they don't do
 * is all decode at once: the observer starts a clip when it scrolls in and
 * pauses it the moment it leaves, so the cost tracks what is actually visible.
 * Pair it with `preload="none"` and the bytes stay off the wire until then.
 *
 * Reduced motion opts out entirely and the poster frame stands in.
 */
export function useClipInView() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void el.play().catch(() => {
            /* autoplay policy or a codec the browser won't take — poster stays */
          });
        } else {
          el.pause();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}
