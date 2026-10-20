import Hero from "../components/Hero.jsx";
import About from "../components/About.jsx";
import WhyChooseUs from "../components/WhyChooseUs.jsx";
import Services from "../components/Services.jsx";
import Process from "../components/Process.jsx";
import Team from "../components/Team.jsx";
import Faq from "../components/Faq.jsx";
import Career from "../components/Career.jsx";
import Testimonials from "../components/Testimonials.jsx";
import Comparison from "../components/Comparison.jsx";
import Blog from "../components/Blog.jsx";
import ClosingBanner from "../components/ClosingBanner.jsx";
import Contact from "../components/Contact.jsx";
import Footer from "../components/Footer.jsx";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <WhyChooseUs />
      <Services />
      <Process />
      <Team />
      <Faq />
      <Career />
      <Testimonials />
      <Comparison />
      <Blog />
      <ClosingBanner />
      <Contact />
      <Footer />
    </>
  );
}
