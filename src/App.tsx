import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Intro from "./components/Intro/Intro";
import Home from "./pages/Home/Home";
import Projects from "./pages/Projects/Projects";
import ProjectDetail from "./pages/Projects/ProjectDetail";
import Skills from "./pages/Skills/Skills";
import Awards from "./pages/Awards/Awards";
import Certs from "./pages/Certs/Certs";
import Homelab from "./pages/Homelab/Homelab";
import CalendarPage from "./pages/Calendar/Calendar";
import Contact from "./pages/Contact/Contact";
import NotFound from "./pages/NotFound";

/** true when this full page-load landed on the home route (intro plays there). */
function isHomeStart(): boolean {
  if (typeof window === "undefined") return true;
  const base = import.meta.env.BASE_URL || "/";
  const p = window.location.pathname;
  return p === "/" || p === base || p === base.replace(/\/$/, "");
}

/** Signals HomeHero's cascade (gated by :root[data-intro="done"]) to play. */
function markIntroDone(): void {
  document.documentElement.dataset.intro = "done";
}

/**
 * App — the intro overlay plays once per full load of the home route, then
 * wipes up to reveal the hero. Blog lives externally (Tistory), so there is
 * no /blog route; Home exposes the external Blog link as a CTA instead.
 */
export default function App() {
  const [homeStart] = useState(isHomeStart);
  const [introDone, setIntroDone] = useState(!homeStart);

  useEffect(() => {
    // landing off-home: no intro, so unblock the hero cascade immediately.
    if (!homeStart) markIntroDone();
  }, [homeStart]);

  const handleIntroComplete = () => {
    markIntroDone();
    setIntroDone(true);
  };

  return (
    <>
      {!introDone && <Intro onComplete={handleIntroComplete} />}
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/awards" element={<Awards />} />
          <Route path="/certs" element={<Certs />} />
          <Route path="/homelab" element={<Homelab />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </>
  );
}
