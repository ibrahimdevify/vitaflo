import Container from "../ui/Container.jsx";
import Button from "../ui/Button.jsx";
import Reveal from "../ui/Reveal.jsx";
import Rich from "./Rich.jsx";
import { PRACTICE_SOLUTION as S } from "../../data/practice.js";

// Blue band right under the hero: "The smartest solution for respiratory care"
export default function PracticeSolution() {
  return (
    <section className="bg-[#35577c] py-16 text-center text-white lg:py-[7vw]">
      <Container>
        <Reveal className="mx-auto flex flex-col items-center lg:max-w-[70vw]">
          <h2 className="m-0 text-[clamp(26px,3vw,80px)] font-normal leading-[1.2] tracking-[-0.02em]">
            {S.heading}
          </h2>
          <p className="m-0 mt-5 text-[clamp(16px,1.25vw,32px)] leading-[1.55] text-white/90 lg:mt-[1.6vw] lg:max-w-[62vw]">
            <Rich>{S.text}</Rich>
          </p>
          <p className="m-0 mt-4 text-[clamp(16px,1.25vw,32px)] leading-[1.55] text-white/90 lg:mt-[1.4vw]">
            {S.sub}
          </p>
          <Button href={S.cta.href} className="mt-8 lg:mt-[2.2vw]">
            {S.cta.label}
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
