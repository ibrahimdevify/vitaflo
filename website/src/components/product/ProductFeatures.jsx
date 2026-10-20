import Container from "../ui/Container.jsx";
import Reveal from "../ui/Reveal.jsx";
import Tag from "../ui/Tag.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import BodyText from "../ui/BodyText.jsx";
import ProductImage from "./ProductImage.jsx";

// Alternating text / image rows. Every second row flips sides on desktop.
export default function ProductFeatures({ items }) {
  return (
    <section className="bg-[#faf9f7] py-16 lg:py-[8vw]">
      <Container>
        <div className="flex flex-col gap-16 lg:gap-[8vw]">
          {items.map((f, i) => {
            const flip = i % 2 === 1;
            return (
              <div
                key={f.title}
                className="grid items-center gap-8 lg:grid-cols-2 lg:gap-[6vw]"
              >
                <Reveal
                  className={`mx-auto w-full max-w-[360px] lg:max-w-[26vw] ${flip ? "lg:order-1" : "lg:order-2"}`}
                >
                  <ProductImage
                    src={f.image}
                    alt={f.imageAlt}
                    label={f.imageName}
                  />
                </Reveal>

                <Reveal
                  delay={0.1}
                  className={flip ? "lg:order-2" : "lg:order-1"}
                >
                  <Tag>{f.eyebrow}</Tag>
                  <SectionHeading className="mt-5 lg:mt-[1.6vw]">
                    {f.title}
                  </SectionHeading>
                  <BodyText className="mt-4 max-w-[48ch] lg:mt-[1.4vw] lg:max-w-[30vw]">
                    {f.text}
                  </BodyText>
                </Reveal>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
