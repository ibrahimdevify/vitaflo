import ProductHero from "../components/product/ProductHero.jsx";
import ProductIntro from "../components/product/ProductIntro.jsx";
import ProductCards from "../components/product/ProductCards.jsx";
import ProductCta from "../components/product/ProductCta.jsx";
import Footer from "../components/Footer.jsx";
import { RAPID_HERO, RAPID_INTRO, RAPID_FEATURES } from "../data/rapidpft.js";

export default function RapidPFT() {
  return (
    <>
      <ProductHero
        title={
          <>
            VitalFlo <span className="text-lime-vc">RapidPFT</span>
            <sup className="ml-1 align-super text-[0.35em]">TM</sup>
          </>
        }
        text={RAPID_HERO.subtitle}
        image={RAPID_HERO.image}
        imageAlt={RAPID_HERO.imageAlt}
        imageLabel={RAPID_HERO.imageLabel}
      />
      <ProductIntro paragraphs={RAPID_INTRO.paragraphs} />
      <ProductCards items={RAPID_FEATURES} />
      <ProductCta title="Contact Us to learn more about VitalFlo RapidPFT" />
      <Footer />
    </>
  );
}
