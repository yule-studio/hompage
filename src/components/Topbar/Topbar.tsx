import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { profile } from "../../data/profile";
import Navigation from "../Navigation/Navigation";

/**
 * Topbar — a transparent bar (portofoliov1 style): brand pill on the left,
 * scroll-nav on the right. It sits over the hero (letting the lanyard hang
 * from the top) and only fades in a subtle blur backdrop once you scroll,
 * so the nav stays readable over content.
 */
export default function Topbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`topbar${scrolled ? " is-scrolled" : ""}`}>
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
