import Container from "./ui/Container.jsx";
import Tag from "./ui/Tag.jsx";
import SectionHeading from "./ui/SectionHeading.jsx";
import BodyText from "./ui/BodyText.jsx";
import Reveal from "./ui/Reveal.jsx";
import ComparisonRow from "./comparison/ComparisonRow.jsx";
import { COMPARISON_ROWS } from "../data/comparison.js";

export default function Comparison() {
  return (
    <section
      id="comparison"
      className="bg-[#faf8f4] py-16 lg:pb-[7.8vw] lg:pt-[7.8vw]"
    >
      <Container>
        <Reveal className="flex flex-col items-center text-center">
          <Tag>COMPARISON</Tag>
          <SectionHeading className="mt-4 lg:mt-[1vw] lg:max-w-[38vw]">
            Respiratory Care Should Feel Simple, Not Stressful
          </SectionHeading>
        </Reveal>

        <Reveal className="mx-auto mt-10 lg:mt-[4.5vw] lg:w-[39.5vw]">
          <div
            aria-hidden="true"
            className="grid grid-cols-[1fr_auto_auto_auto_1fr] items-center border-b border-black/20 pb-4 text-[clamp(15px,1.2vw,30px)] leading-tight lg:pb-[1.6vw]"
          >
            <span className="pr-[clamp(8px,1.25vw,32px)] text-right text-[#8a8a8a]">
              The old way
            </span>
            {/* Invisible copies of the row icons keep the labels over the right columns */}
            <span className="invisible h-[clamp(24px,1.35vw,34px)] w-[clamp(24px,1.35vw,34px)]" />
            <span className="invisible mx-[clamp(6px,2vw,52px)] h-[clamp(14px,0.85vw,22px)] w-[clamp(14px,0.85vw,22px)]" />
            <span className="invisible h-[clamp(24px,1.35vw,34px)] w-[clamp(24px,1.35vw,34px)]" />
            <span className="pl-[clamp(8px,1.25vw,32px)] text-left text-[#0f0f0f]">
              The VitalFlo way
            </span>
          </div>

          <ul className="m-0 list-none p-0">
            {COMPARISON_ROWS.map((r) => (
              <ComparisonRow key={r.old} before={r.old} after={r.next} />
            ))}
          </ul>

          <BodyText
            size="lg"
            className="mx-auto mt-10 text-center lg:mt-[4.4vw] lg:max-w-[37vw]"
          >
            One platform for respiratory care in every setting: in-office,
            bedside, and at home.
          </BodyText>
        </Reveal>
      </Container>
    </section>
  );
}
