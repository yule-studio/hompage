import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "awards", label: "Awards" },
  { id: "certs", label: "Certs" },
  { id: "homelab", label: "Homelab" },
  { id: "calendar", label: "Calendar" },
  { id: "contact", label: "Contact" },
];

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const onHome = location.pathname === "/";
  const [active, setActive] = useState("home");

  // Track the section in view (home only).
  useEffect(() => {
    if (!onHome) return;
    const sections = ITEMS.map((it) => document.getElementById(it.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [onHome]);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setActive(id);
    const hash = id === "home" ? "/" : `/#${id}`;
    if (onHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", hash);
    } else {
      navigate(hash);
    }
  };

  return (
    <nav className="nav scroll-nav" aria-label="Primary">
      <div className="nav-pill" role="tablist">
        {ITEMS.map((it) => (
          <a
            key={it.id}
            href={`/#${it.id}`}
            className="nav-item"
            aria-current={onHome && active === it.id ? "page" : undefined}
            onClick={(e) => handleClick(e, it.id)}
          >
            <span className="nav-mark" aria-hidden />
            <span>{it.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
