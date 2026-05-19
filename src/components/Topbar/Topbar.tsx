import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { profile } from "../../data/profile";

type Theme = "dark" | "light";

const STORAGE_KEY = "yule.theme";

function readInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "dark" || saved === "light") return saved;
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
  return prefersLight ? "light" : "dark";
}

export default function Topbar() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link to="/" className="brand" aria-label={`${profile.handle} — home`}>
          <span className="brand-dot" aria-hidden />
          <span className="brand-handle">{profile.handle}</span>
        </Link>

        <div className="topbar-spacer" />

        <span className="topbar-status" role="status" aria-live="polite">
          <span className="topbar-status-dot" aria-hidden />
          <span>{profile.status.label}</span>
        </span>

        <button
          type="button"
          className="theme-toggle"
          onClick={toggle}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? <MoonIcon /> : <SunIcon />}
          <span>{theme.toUpperCase()}</span>
        </button>
      </div>
    </header>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}
