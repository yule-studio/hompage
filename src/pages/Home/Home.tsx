import { useEffect } from "react";
import HomeHero from "../../components/Hero/HomeHero";
import Navigation from "../../components/Navigation/Navigation";
import { useReveal } from "../../hooks/useReveal";
import Projects from "../Projects/Projects";
import Skills from "../Skills/Skills";
import Awards from "../Awards/Awards";
import Certs from "../Certs/Certs";
import Homelab from "../Homelab/Homelab";
import CalendarPage from "../Calendar/Calendar";
import Contact from "../Contact/Contact";

/**
 * Home — a single-page scroll narrative. The hero leads, a sticky scroll-nav
 * jumps to each section, and every area (Projects → Contact) is rendered
 * inline as a `<section>` that reveals as it scrolls into view.
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

      <Navigation />

      <section id="projects" className="scroll-section reveal" aria-label="projects">
        <Projects />
      </section>
      <section id="skills" className="scroll-section reveal" aria-label="skills">
        <Skills />
      </section>
      <section id="awards" className="scroll-section reveal" aria-label="awards">
        <Awards />
      </section>
      <section id="certs" className="scroll-section reveal" aria-label="certs">
        <Certs />
      </section>
      <section id="homelab" className="scroll-section reveal" aria-label="homelab">
        <Homelab />
      </section>
      <section id="calendar" className="scroll-section reveal" aria-label="calendar">
        <CalendarPage />
      </section>
      <section id="contact" className="scroll-section reveal" aria-label="contact">
        <Contact />
      </section>
    </div>
  );
}
