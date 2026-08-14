import { useEffect } from "react";
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
  useReveal();

  // Deep-link support: scroll to the hash section after sections mount.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const t = window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView();
    }, 80);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="scroll-home">
      <HomeHero />

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
