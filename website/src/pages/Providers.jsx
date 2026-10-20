import ProductHero from "../components/product/ProductHero.jsx";
import ProductSteps from "../components/product/ProductSteps.jsx";
import ProductBenefits from "../components/product/ProductBenefits.jsx";
import ProductListCards from "../components/product/ProductListCards.jsx";
import ProductCta from "../components/product/ProductCta.jsx";
import Footer from "../components/Footer.jsx";
import {
  PROVIDERS_HERO,
  PROVIDERS_STEPS,
  PROVIDERS_BENEFITS,
  PROVIDERS_INSIGHTS,
  PROVIDERS_CTA_TITLE,
} from "../data/providers.js";

export default function Providers() {
  return (
    <>
      <ProductHero
        title={
          <>
            Bring the Test to the <span className="text-lime-vc">Patient</span>
          </>
        }
        {...PROVIDERS_HERO}
      />
      <ProductSteps {...PROVIDERS_STEPS} />
      <ProductBenefits {...PROVIDERS_BENEFITS} />
      <ProductListCards {...PROVIDERS_INSIGHTS} />
      <ProductCta title={PROVIDERS_CTA_TITLE} />
      <Footer />
    </>
  );
}
