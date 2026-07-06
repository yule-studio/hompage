import { Link } from "react-router-dom";
import { profile } from "../../data/profile";

/**
 * Topbar — brand + system status. The site is dark-only, so there is no
 * theme toggle; the theme is fixed via `data-theme="dark"` on <html>.
 */
export default function Topbar() {
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
      </div>
    </header>
  );
}
