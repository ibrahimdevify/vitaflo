import Container from "./ui/Container.jsx";
import Tag from "./ui/Tag.jsx";
import SectionHeading from "./ui/SectionHeading.jsx";
import Reveal from "./ui/Reveal.jsx";
import Accordion from "./ui/Accordion.jsx";
import { FEATURED_FAQS, MORE_FAQS } from "../data/faq.js";

export default function Faq() {
  return (
    <section id="faq" className="bg-[#faf8f4] pb-16 lg:pb-[7.8vw]">
      <Container>
        <Reveal className="flex flex-col items-center text-center">
          <Tag>REAL QUESTIONS</Tag>
          <SectionHeading className="mt-4 lg:mt-[1vw] lg:max-w-[28vw]">
            What everyone asks first
          </SectionHeading>
        </Reveal>

        <div className="mx-auto mt-10 lg:mt-[4.8vw] lg:w-[39.6vw]">
          <Reveal>
            <Accordion items={FEATURED_FAQS} defaultOpen={0} />
          </Reveal>

          <Reveal>
            <h3 className="mt-12 text-[clamp(22px,1.8vw,46px)] font-normal leading-tight tracking-[-0.02em] text-[#0f0f0f] lg:mt-[3.6vw]">
              More Questions
            </h3>
            <Accordion items={MORE_FAQS} className="mt-2 lg:mt-[1.2vw]" />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
