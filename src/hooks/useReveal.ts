import { useEffect } from "react";

/**
 * useReveal — reveals every `.reveal` element once it scrolls into view by
 * adding `.is-visible` (CSS handles the fade/rise). Reveal-once. Falls back
 * to showing everything when IntersectionObserver is unavailable.
 *
 * Two guards keep the reveal feeling intentional:
 *  - It doesn't start observing until the intro overlay is done, so sections
 *    that geometrically intersect the viewport *behind* the overlay don't
 *    settle before they're ever seen.
 *  - The trigger line sits ~20% up from the bottom, so a section merely
 *    peeking under the hero waits until it's properly scrolled into view.
 *
 * Re-runs when `deps` change so newly-mounted sections get observed.
 */
export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let mo: MutationObserver | null = null;

    const start = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)"));
      if (!els.length) return;

      if (!("IntersectionObserver" in window)) {
        els.forEach((el) => el.classList.add("is-visible"));
        return;
      }

      observer = new IntersectionObserver(
        (entries, obs) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          }
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
      );
      els.forEach((el) => observer!.observe(el));
    };

    const introDone = () => document.documentElement.dataset.intro === "done";
    if (introDone()) {
      start();
    } else {
      mo = new MutationObserver(() => {
        if (introDone()) {
          mo?.disconnect();
          mo = null;
          start();
        }
      });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-intro"] });
    }

    return () => {
      observer?.disconnect();
      mo?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default useReveal;
