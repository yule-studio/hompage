import { Link } from "react-router-dom";
import { profile } from "../../data/profile";
import Navigation from "../Navigation/Navigation";

/**
 * Topbar — brand on the left, primary scroll-nav on the right (single-page
 * style). Dark-only, so no theme toggle.
 */
export default function Topbar() {
  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link to="/" className="brand" aria-label={`${profile.handle} — home`}>
          <span className="brand-dot" aria-hidden />
          <span className="brand-handle">{profile.handle}</span>
        </Link>

        <Navigation />
      </div>
    </header>
  );
}
