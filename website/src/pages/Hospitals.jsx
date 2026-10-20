import ProductHero from "../components/product/ProductHero.jsx";
import ProductIntro from "../components/product/ProductIntro.jsx";
import ProductFeatures from "../components/product/ProductFeatures.jsx";
import ProductCta from "../components/product/ProductCta.jsx";
import Footer from "../components/Footer.jsx";
import {
  HOSPITALS_HERO,
  HOSPITALS_INTRO,
  HOSPITALS_FEATURES,
  HOSPITALS_CTA,
} from "../data/hospitals.js";

export default function Hospitals() {
  return (
    <>
      <ProductHero {...HOSPITALS_HERO} />
      <ProductIntro {...HOSPITALS_INTRO} />
      <ProductFeatures items={HOSPITALS_FEATURES} />
      <ProductCta {...HOSPITALS_CTA} />
      <Footer />
    </>
  );
}
