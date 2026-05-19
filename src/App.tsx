import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home/Home";
import Projects from "./pages/Projects/Projects";
import Skills from "./pages/Skills/Skills";
import Awards from "./pages/Awards/Awards";
import Certs from "./pages/Certs/Certs";
import Homelab from "./pages/Homelab/Homelab";
import CalendarPage from "./pages/Calendar/Calendar";
import Contact from "./pages/Contact/Contact";
import NotFound from "./pages/NotFound";

/**
 * Routes — Blog lives externally (Tistory), so there is no /blog route.
 * The Home page exposes the external Blog link as a CTA button instead.
 */
export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/awards" element={<Awards />} />
        <Route path="/certs" element={<Certs />} />
        <Route path="/homelab" element={<Homelab />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
