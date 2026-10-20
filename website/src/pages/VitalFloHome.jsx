import ProductHero from "../components/product/ProductHero.jsx";
import ProductIntro from "../components/product/ProductIntro.jsx";
import ProductFeatures from "../components/product/ProductFeatures.jsx";
import Testimonials from "../components/Testimonials.jsx";
import Contact from "../components/Contact.jsx";
import Footer from "../components/Footer.jsx";
import { HOME_HERO, HOME_INTRO, HOME_FEATURES } from "../data/vitalflohome.js";

export default function VitalFloHome() {
  return (
    <>
      <ProductHero
        eyebrow={HOME_HERO.eyebrow}
        title={HOME_HERO.title}
        text={HOME_HERO.text}
        image={HOME_HERO.image}
        imageAlt={HOME_HERO.imageAlt}
        imageLabel="hero.png"
      />
      <ProductIntro {...HOME_INTRO} />
      <ProductFeatures items={HOME_FEATURES} />
      <Testimonials />
      <Contact />
      <Footer />
    </>
  );
}
