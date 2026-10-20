import { Link } from "react-router-dom";
import Container from "../ui/Container.jsx";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import BodyText from "../ui/BodyText.jsx";

// Blue band under the hero. `title` and `cta` are optional.
export default function ProductIntro({ title, paragraphs, cta }) {
  return (
    <section className="bg-[#35577c] py-16 text-center lg:py-[6vw]">
      <Container>
        {title && (
          <Reveal>
            <SectionHeading
              tone="light"
              className="mx-auto max-w-[22ch] lg:max-w-[48vw]"
            >
              {title}
            </SectionHeading>
          </Reveal>
        )}
        <Reveal
          delay={0.1}
          className={`mx-auto lg:max-w-[48vw] ${title ? "mt-6 lg:mt-[2.5vw]" : ""}`}
        >
          {paragraphs.map((p) => (
            <BodyText
              key={p}
              tone="light"
              size="lg"
              className="mb-4 last:mb-0 lg:mb-[1.4vw]"
            >
              {p}
            </BodyText>
          ))}
          {cta && (
            <Link
              to="/contact"
              className="mt-4 inline-flex items-center rounded-full bg-lime-vc px-[clamp(20px,2vw,48px)] py-[clamp(10px,0.9vw,22px)] text-[clamp(14px,0.95vw,22px)] font-medium text-ink-vc transition-opacity hover:opacity-90 lg:mt-[1vw]"
            >
              {cta} →
            </Link>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
