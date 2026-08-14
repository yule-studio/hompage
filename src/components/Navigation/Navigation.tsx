import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getShowcaseTab,
  setShowcaseTab,
  subscribeShowcaseTab,
} from "../Showcase/showcaseTab";

/**
 * Primary navigation — a single-page scroll nav.
 *
 * Every item points at a section on the home route (`/#id`). On the home
 * page a click smooth-scrolls to the section and the active item tracks the
 * section in view (IntersectionObserver). From any other route a click
 * routes home to that hash. Blog lives on an external host (Tistory), so it
 * is intentionally not listed.
 */
const ITEMS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "portfolio", label: "Portfolio" },
  { id: "homelab", label: "Homelab" },
  { id: "contact", label: "Contact" },
];

/**
 * Sections the scroll-spy can actually track. Homelab is a TAB inside
 * #portfolio now, not a section of its own — spying on its anchor would make it
 * win over Portfolio for the whole showcase, so the tab decides that one.
 */
const SPY_IDS = ["home", "about", "portfolio", "contact"];

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const onHome = location.pathname === "/";
  const [active, setActive] = useState("home");
  const [tab, setTab] = useState(getShowcaseTab);

  useEffect(() => subscribeShowcaseTab(setTab), []);

  // inside the showcase, the selected tab picks which item lights up
  const current = active === "portfolio" && tab === "homelab" ? "homelab" : active;

  // Track the section in view (home only). Scroll-spy: the active item is the
  // last section whose top has scrolled above a line just under the topbar — so
  // at the top the hero (#home) is active, not whatever peeks below it.
  useEffect(() => {
    if (!onHome) return;
    const onScroll = () => {
      const line = 140;
      let seen = SPY_IDS[0];
      for (const id of SPY_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) seen = id;
      }
      setActive(seen);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [onHome]);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();

    // Homelab and Portfolio share the #portfolio section — the item picks the tab
    if (id === "homelab" || id === "portfolio") {
      setShowcaseTab(id === "homelab" ? "homelab" : "projects");
    }
    setActive(id === "homelab" ? "portfolio" : id);

    if (onHome) {
      // smooth-scroll but DON'T write the hash to the URL — otherwise a reload
      // would deep-link back to that section instead of starting at Home.
      const target = id === "homelab" ? "portfolio" : id;
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
    } else {
      // state, not `/#id` — a hash would stay in the address bar and make the
      // next reload open on that section instead of Home
      navigate("/", id === "home" ? undefined : { state: { section: id === "homelab" ? "portfolio" : id } });
    }
  };

  return (
    <nav className="topnav" aria-label="Primary">
      <ul className="topnav-list" role="tablist">
        {ITEMS.map((it) => (
          <li key={it.id}>
            <a
              href={`/#${it.id}`}
              className="topnav-item"
              aria-current={onHome && current === it.id ? "page" : undefined}
              onClick={(e) => handleClick(e, it.id)}
            >
              <span className="topnav-dot" aria-hidden />
              <span>{it.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
