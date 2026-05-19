import { ReactNode } from "react";
import Topbar from "../Topbar/Topbar";

type Props = { children: ReactNode };

/**
 * Layout — Topbar at top, page content fills the main column.
 * Navigation is intentionally NOT rendered here; each page mounts
 * <Navigation /> *after* its hero/page-header so the nav sits
 * visually under the profile, not above it.
 */
export default function Layout({ children }: Props) {
  return (
    <>
      <a href="#main" className="skip-link">
        본문으로 건너뛰기
      </a>
      <Topbar />
      <main id="main" className="page">
        <div className="container">{children}</div>
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
