import Container from "../ui/Container.jsx";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import BodyText from "../ui/BodyText.jsx";
import ProductImage from "./ProductImage.jsx";

// "How it works": text column stays sticky on desktop while the steps scroll.
export default function ProductSteps({ title, paragraphs, steps }) {
  return (
    <section className="bg-[#faf9f7] py-16 lg:py-[7vw]">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-[6vw]">
          <div className="lg:sticky lg:top-[6vw] lg:self-start">
            <Reveal>
              <SectionHeading>{title}</SectionHeading>
              <div className="mt-5 flex flex-col gap-5 lg:mt-[1.6vw] lg:gap-[1.4vw]">
                {paragraphs.map((p) => (
                  <BodyText key={p} className="max-w-[52ch] lg:max-w-[32vw]">
                    {p}
                  </BodyText>
                ))}
              </div>
            </Reveal>
          </div>

          <ol className="m-0 flex list-none flex-col gap-16 p-0 lg:gap-[7vw]">
            {steps.map((s) => (
              <li key={s.label} className="lg:min-h-[34vw]">
                <Reveal>
                  <p className="m-0 text-[clamp(20px,1.9vw,48px)] font-medium text-[#3a95f0]">
                    {s.label}
                  </p>
                  <div className="mx-auto mt-5 w-full max-w-[380px] lg:mx-0 lg:mt-[1.6vw] lg:max-w-[24vw]">
                    <ProductImage
                      src={s.image}
                      alt={s.imageAlt}
                      label={s.imageName}
                    />
                  </div>
                  <BodyText className="mt-5 max-w-[44ch] lg:mt-[1.6vw] lg:max-w-[26vw]">
                    {s.text}
                  </BodyText>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
