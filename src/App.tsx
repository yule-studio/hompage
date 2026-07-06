import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
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

/**
 * MVP: intro 를 매 로드마다 보여준다(리뷰 / 개발 테스트 편의).
 * 첫 방문에만 보여주려면 `SHOW_INTRO_ONCE = true` 로 바꾸면 된다 —
 * 그때만 `yule.intro.seen` localStorage 키로 gating 한다.
 */
const INTRO_SEEN_KEY = "yule.intro.seen";
const SHOW_INTRO_ONCE = false;

function shouldShowIntro(): boolean {
  if (!SHOW_INTRO_ONCE) return true;
  try {
    return window.localStorage.getItem(INTRO_SEEN_KEY) !== "1";
  } catch {
    return true;
  }
}

function markIntroSeen(): void {
  if (!SHOW_INTRO_ONCE) return;
  try {
    window.localStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    /* localStorage unavailable — ignore, intro simply shows again next load */
  }
}

/**
 * Routes — Blog lives externally (Tistory), so there is no /blog route.
 * The Home page exposes the external Blog link as a CTA button instead.
 */
export default function App() {
  const [introDone, setIntroDone] = useState(() => !shouldShowIntro());

  const handleIntroComplete = () => {
    markIntroSeen();
    setIntroDone(true);
  };

  return (
    <>
      {!introDone && <LoadingScreen onComplete={handleIntroComplete} />}
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
