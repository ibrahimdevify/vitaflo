import ProductHero from "../components/product/ProductHero.jsx";
import ProductIntro from "../components/product/ProductIntro.jsx";
import ProductFeatures from "../components/product/ProductFeatures.jsx";
import ProductLogos from "../components/product/ProductLogos.jsx";
import ProductLinks from "../components/product/ProductLinks.jsx";
import ProductCta from "../components/product/ProductCta.jsx";
import Footer from "../components/Footer.jsx";
import {
  TRIALS_HERO,
  TRIALS_INTRO,
  TRIALS_FEATURES,
  TRIALS_LOGOS_TITLE,
  TRIALS_LOGOS,
  TRIALS_PUBLICATIONS_TITLE,
  TRIALS_PUBLICATIONS,
} from "../data/trials.js";

export default function Trials() {
  return (
    <>
      <ProductHero {...TRIALS_HERO} />
      <ProductIntro {...TRIALS_INTRO} />
      <ProductFeatures items={TRIALS_FEATURES} />
      <ProductLogos title={TRIALS_LOGOS_TITLE} logos={TRIALS_LOGOS} />
      <ProductLinks
        title={TRIALS_PUBLICATIONS_TITLE}
        items={TRIALS_PUBLICATIONS}
      />
      <ProductCta
        title="Let's design your next research study together"
        button="Get Started"
      />
      <Footer />
    </>
  );
}
