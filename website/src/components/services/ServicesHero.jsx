import Navbar from "../Navbar.jsx";
import Pulse from "../Pulse.jsx";
import Container from "../ui/Container.jsx";
import BigWord from "../ui/BigWord.jsx";
import BodyText from "../ui/BodyText.jsx";
import Reveal from "../ui/Reveal.jsx";

export default function ServicesHero() {
  return (
    <section className="hero-bg relative overflow-hidden pb-20 text-white lg:pb-[15.6vw]">
      <div
        className="grid-lines pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <Navbar />

      <Container className="relative z-10">
        <Reveal y={60}>
          <h1 className="m-0 mx-auto mt-10 w-full select-none lg:mt-[7.2vw] lg:w-[53.5vw]">
            <BigWord>SERVICES</BigWord>
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-y-2 text-[clamp(14px,0.9vw,24px)] lg:mt-[2.3vw] lg:flex-nowrap">
            <span className="whitespace-nowrap">About VitalFlo Healthcare</span>
            <span className="mx-[1.25vw] hidden h-px flex-1 bg-gradient-to-r from-white/50 to-white/20 lg:block" />
            <span className="flex items-center gap-[1.1vw] whitespace-nowrap">
              Since <Pulse /> 2017
            </span>
          </div>
        </Reveal>

        <Reveal
          delay={0.2}
          className="mx-auto mt-8 text-center lg:mt-[3.5vw] lg:max-w-[38vw]"
        >
          <BodyText
            tone="light"
            size="lg"
            className="lg:text-[clamp(18px,1.2vw,30px)] lg:leading-[1.5]"
          >
            VitalFlo&apos;s proactive respiratory care platform helps medical
            groups, hospitals, and ACOs test, monitor, and track their pulmonary
            patients in any care setting: in the office, at the bedside, and at
            home.
          </BodyText>
        </Reveal>
      </Container>
    </section>
  );
}
