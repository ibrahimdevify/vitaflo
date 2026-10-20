import ProductHero from "../components/product/ProductHero.jsx";
import ProductIntro from "../components/product/ProductIntro.jsx";
import ProductFeatures from "../components/product/ProductFeatures.jsx";
import ProductCta from "../components/product/ProductCta.jsx";
import Footer from "../components/Footer.jsx";
import {
  ACOS_HERO,
  ACOS_INTRO,
  ACOS_FEATURES,
  ACOS_CTA,
} from "../data/acos.js";

export default function ACOs() {
  return (
    <>
      <ProductHero {...ACOS_HERO} />
      <ProductIntro {...ACOS_INTRO} />
      <ProductFeatures items={ACOS_FEATURES} />
      <ProductCta {...ACOS_CTA} />
      <Footer />
    </>
  );
}
