import { useEffect } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import gsap from "gsap";
import Home from "./pages/Home.jsx";
import useSmoothScroll from "./hooks/useSmoothScroll.js";
import About from "./pages/About.jsx";
import Services from "./pages/Services.jsx";
import Career from "./pages/Career.jsx";
import Blog from "./pages/Blog.jsx";
import BlogPost from "./pages/BlogPost.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import Demo from "./pages/Demo.jsx";
import NotFound from "./pages/NotFound.jsx";
import VitalFloPractice from "./pages/VitalFloPractice.jsx";
import VitalFloHome from "./pages/VitalFloHome.jsx";
import RapidPFT from "./pages/RapidPFT.jsx";
import Trials from "./pages/Trials.jsx";
import Hospitals from "./pages/Hospitals.jsx";
import ACOs from "./pages/ACOs.jsx";
import Providers from "./pages/Providers.jsx";
import Terms from "./pages/Terms.jsx";
import Privacy from "./pages/Privacy.jsx";
function ComingSoon() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#35577c] text-3xl font-light">
      Coming soon
    </div>
  );
}

// New page = start at the top. Back / forward buttons keep the browser's own
// scroll position, and #anchor links are left to the smooth-scroll hook.
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const type = useNavigationType();

  useEffect(() => {
    if (hash || type === "POP") return;
    gsap.killTweensOf(window);
    window.scrollTo(0, 0);
  }, [pathname, hash, type]);

  return null;
}

export default function App() {
  useSmoothScroll();

  return (
    <main>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/career" element={<Career />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/vitalflopractice" element={<VitalFloPractice />} />
        <Route path="/vitalflohome" element={<VitalFloHome />} />
        <Route path="/rapidpft" element={<RapidPFT />} />
        <Route path="/research-and-clinical-trials" element={<Trials />} />
        <Route path="/hospital-health-systems" element={<Hospitals />} />
        <Route path="/healthcare-providers" element={<Providers />} />
        <Route path="/acos-ma-plans" element={<ACOs />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/terms-of-service" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<ComingSoon />} />
        <Route path="/privacy" element={<ComingSoon />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
}
