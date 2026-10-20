import Container from "./ui/Container.jsx";
import Tag from "./ui/Tag.jsx";
import SectionHeading from "./ui/SectionHeading.jsx";
import Reveal from "./ui/Reveal.jsx";
import ProcessStep from "./process/ProcessStep.jsx";
import { PROCESS_STEPS } from "../data/process.js";

export default function Process() {
  return (
    <section id="process" className="process-bg py-16 lg:py-[7.8vw]">
      <Container>
        <Reveal className="flex flex-col items-center text-center">
          <Tag tone="glass">PROCESS</Tag>
          <SectionHeading
            tone="light"
            className="mt-4 lg:mt-[1vw] lg:max-w-[40vw]"
          >
            Proactive Respiratory Care, Step by Step
          </SectionHeading>
        </Reveal>

        <div className="mt-12 flex flex-col gap-14 lg:mt-[6.8vw] lg:gap-[7.7vw]">
          {PROCESS_STEPS.map((step, i) => (
            <ProcessStep key={step.title} step={step} reverse={i % 2 === 1} />
          ))}
        </div>
      </Container>
    </section>
  );
}
