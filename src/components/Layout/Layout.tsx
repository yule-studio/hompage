import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Topbar from "../Topbar/Topbar";

type Props = { children: ReactNode };

/**
 * Layout — Topbar at top, page content fills the main column.
 * Navigation is intentionally NOT rendered here; each page mounts
 * <Navigation /> *after* its hero/page-header.
 *
 * `key={location.pathname}` on page-shell forces a remount on every route
 * change so the slide-up CSS keyframe re-fires.
 */
export default function Layout({ children }: Props) {
  const location = useLocation();
  return (
    <>
      <a href="#main" className="skip-link">
        본문으로 건너뛰기
      </a>
      <Topbar />
      <main id="main" className="page">
        <div className="container">
          <div className="page-shell page-anim" key={location.pathname}>
            {children}
          </div>
        </div>
      </main>
      <footer className="site-footer">
        <div className="container site-footer-inner">
          <span className="mono">© 2026 yule-studio · self-hosted</span>
          <span className="mono">build: dev · region: home</span>
        </div>
      </footer>
    </>
  );
}
