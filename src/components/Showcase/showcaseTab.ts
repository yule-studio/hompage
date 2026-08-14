/**
 * The showcase's selected tab, shared with the topbar.
 *
 * Homelab used to be its own page section; it is now a tab inside the
 * showcase, so the nav has to be able to select it — and to light up the right
 * item once it is selected. That's the only cross-component state here, so a
 * subscribable module value beats threading props or adding a context.
 */
export type TabId = "projects" | "certificates" | "techstack" | "homelab";

let current: TabId = "projects";
const listeners = new Set<(tab: TabId) => void>();

export function getShowcaseTab(): TabId {
  return current;
}

export function setShowcaseTab(tab: TabId): void {
  if (tab === current) return;
  current = tab;
  listeners.forEach((listen) => listen(tab));
}

export function subscribeShowcaseTab(listen: (tab: TabId) => void): () => void {
  listeners.add(listen);
  return () => {
    listeners.delete(listen);
  };
}
