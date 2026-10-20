import Navbar from "../Navbar.jsx";
import GridBackdrop from "../ui/GridBackdrop.jsx";
import Pulse from "../Pulse.jsx";
import Container from "../ui/Container.jsx";
import BigWord from "../ui/BigWord.jsx";
import BodyText from "../ui/BodyText.jsx";
import Button from "../ui/Button.jsx";
import Reveal from "../ui/Reveal.jsx";
import Rich from "./Rich.jsx";
import platform from "../../assets/spirometry.png";
import { PRACTICE_HERO, CARE_SETTINGS } from "../../data/practice.js";

export default function PracticeHero() {
  return (
    <>
      <section className="hero-bg relative overflow-hidden pb-48 text-white lg:pb-[17vw]">
        <GridBackdrop />
        <Navbar />
        <Container className="relative z-10">
          <Reveal y={60}>
            <h1 className="m-0 mx-auto mt-10 w-full select-none lg:mt-[7.2vw] lg:w-[53.5vw]">
              <BigWord>PRACTICE</BigWord>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[clamp(14px,0.9vw,24px)] lg:mt-[2.3vw] lg:flex-nowrap">
              <span className="whitespace-nowrap">{PRACTICE_HERO.eyebrow}</span>
              <span className="mx-[1.25vw] hidden h-px flex-1 bg-gradient-to-r from-white/50 to-white/20 sm:block" />
              <span className="flex items-center gap-3 whitespace-nowrap lg:gap-[1.1vw]">
                Since <Pulse /> 2017
              </span>
            </div>
          </Reveal>
          <Reveal
            delay={0.2}
            className="mx-auto mt-10 flex flex-col items-center text-center lg:mt-[4vw] lg:max-w-[max(42vw,34rem)]"
          >
            <h2 className="m-0 text-[clamp(30px,3.4vw,88px)] font-light leading-[1.15] tracking-[-0.02em]">
              {PRACTICE_HERO.headline}
            </h2>
            <BodyText
              tone="light"
              size="lg"
              className="mt-5 lg:mt-[1.6vw] lg:max-w-[max(34vw,30rem)] lg:text-[clamp(17px,1.1vw,28px)]"
            >
              <Rich>{PRACTICE_HERO.text}</Rich>
            </BodyText>
            <Button
              href={PRACTICE_HERO.cta.href}
              className="mt-8 lg:mt-[2.2vw]"
            >
              {PRACTICE_HERO.cta.label}
            </Button>
          </Reveal>
        </Container>
      </section>
      <section className="relative z-10 -mt-48 bg-[linear-gradient(to_bottom,transparent_12rem,#faf8f4_12rem)] lg:-mt-[17vw] lg:bg-[linear-gradient(to_bottom,transparent_17vw,#faf8f4_17vw)]">
        <Container className="pt-8 lg:pt-[3.5vw]">
          <Reveal y={60} scale={0.96}>
            {/* The product picture has a solid white background, so it sits in a white
                card (rounded + shadow) instead of looking like a stray white box. */}
            <div className="mx-auto w-[min(88vw,560px)] overflow-hidden rounded-[clamp(20px,2vw,48px)] bg-white shadow-[0_30px_80px_-20px_rgba(20,40,70,0.45)] lg:w-[40vw]">
              <img
                src={platform}
                alt="VitalFloPRACTICE on tablet and phone"
                width="925"
                height="800"
                className="block h-auto w-full"
              />
            </div>
          </Reveal>
          <ul className="mx-auto mt-8 flex flex-wrap justify-center gap-3 pb-4 lg:mt-[2vw] lg:gap-[0.9vw]">
            {CARE_SETTINGS.map((s) => (
              <li
                key={s}
                className="rounded-full border border-[#2c4d77]/40 px-5 py-2 text-[clamp(14px,0.9vw,22px)] text-[#2c4d77] lg:px-[1.4vw] lg:py-[0.6vw]"
              >
                {s}
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
