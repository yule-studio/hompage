import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import About from "../../components/About/About";
import HomeHero from "../../components/Hero/HomeHero";
import { useReveal } from "../../hooks/useReveal";
import PortfolioShowcase from "../../components/Showcase/PortfolioShowcase";
import Contact from "../Contact/Contact";

/**
 * Home — a single-page scroll narrative. The hero leads, a sticky scroll-nav
 * jumps to each section, and every area reveals as it scrolls into view.
 * Portfolio + Contact fade in as a block while their inner pieces rise in a
 * short stagger (see `.reveal--fade` in layout.css).
 */
export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  useReveal();

  // Section to scroll to, handed over by the nav when it routes home from
  // another page. Router state, not a hash — nothing sticks in the address bar.
  const target = (location.state as { section?: string } | null)?.section;

  useEffect(() => {
    /**
     * That state lives in the history entry, so it SURVIVES a reload — without
     * this guard, reloading after "Contact" would keep reopening on Contact
     * forever. Consume it immediately and ignore it on a reload, so a refresh
     * always starts at Home.
     */
    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const id = nav?.type === "reload" ? "" : target ?? window.location.hash.slice(1);
    if (target) navigate(".", { replace: true, state: null });

    if (!id) {
      if (nav?.type === "reload") window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView();
    }, 80);
    return () => window.clearTimeout(t);
  }, [target, navigate]);

  return (
    <div className="scroll-home">
      <HomeHero />

      <section id="about" className="scroll-section reveal" aria-label="about">
        <About />
      </section>

      {/* Homelab is no longer its own section — it's a tab inside the showcase,
          which also hosts the #homelab anchor the topbar links to. */}
      <section id="portfolio" className="scroll-section reveal reveal--fade" aria-label="portfolio">
        <PortfolioShowcase />
      </section>
      <section id="contact" className="scroll-section reveal reveal--fade" aria-label="contact">
        <Contact />
      </section>
    </div>
  );
}
