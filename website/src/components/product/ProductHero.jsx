import Navbar from "../Navbar.jsx";
import Container from "../ui/Container.jsx";
import Reveal from "../ui/Reveal.jsx";
import BodyText from "../ui/BodyText.jsx";
import ProductImage from "./ProductImage.jsx";

// Shared hero for the product pages. `title` can be text or JSX.
export default function ProductHero({
  eyebrow,
  title,
  text,
  image,
  imageAlt,
  imageLabel = "hero.png",
}) {
  return (
    <section className="hero-bg relative overflow-hidden pb-16 text-white lg:pb-[8vw]">
      <div
        className="grid-lines pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <Navbar />

      <Container className="relative z-10">
        <div className="mt-12 grid items-center gap-10 lg:mt-[6vw] lg:grid-cols-[1.15fr_0.85fr] lg:gap-[4vw]">
          <Reveal y={50}>
            {eyebrow && (
              <p className="m-0 mb-4 text-[clamp(13px,0.9vw,22px)] uppercase tracking-wide text-lime-vc lg:mb-[1.2vw]">
                {eyebrow}
              </p>
            )}
            <h1 className="m-0 text-[clamp(34px,4.4vw,110px)] font-normal leading-[1.1] tracking-[-0.025em]">
              {title}
            </h1>
            {text && (
              <BodyText
                tone="light"
                size="lg"
                className="mt-6 max-w-[40ch] lg:mt-[2vw] lg:max-w-[34vw]"
              >
                {text}
              </BodyText>
            )}
          </Reveal>

          <Reveal
            delay={0.15}
            className="mx-auto w-full max-w-[420px] lg:max-w-none"
          >
            <ProductImage src={image} alt={imageAlt} label={imageLabel} round />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
