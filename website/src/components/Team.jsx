import Container from "./ui/Container.jsx";
import Tag from "./ui/Tag.jsx";
import SectionHeading from "./ui/SectionHeading.jsx";
import BodyText from "./ui/BodyText.jsx";
import Reveal from "./ui/Reveal.jsx";
import MarqueeTrack from "./ui/MarqueeTrack.jsx";
import TeamCard from "./team/TeamCard.jsx";
import CenterMark from "./team/CenterMark.jsx";
import { TEAM } from "../data/team.js";

export default function Team() {
  const loop = [...TEAM, ...TEAM]; // patti kabhi khali na dikhe

  return (
    <section id="team" className="bg-[#faf8f4] py-16 lg:py-[7.8vw]">
      <Container>
        <Reveal className="flex flex-col items-center text-center">
          <Tag>OUR MEDICAL TEAM</Tag>
          <SectionHeading className="mt-4 lg:mt-[1vw] lg:max-w-[32vw]">
            Meet the Experts Behind Your Care
          </SectionHeading>
        </Reveal>
      </Container>

      <div className="relative mt-12 lg:mt-[5.9vw] lg:h-[20vw]">
        <MarqueeTrack duration={45} className="team-mask lg:pt-[2.2vw]">
          {loop.map((m, i) => (
            <TeamCard key={`${m.name}-${i}`} member={m} />
          ))}
        </MarqueeTrack>
        <CenterMark className="pointer-events-none absolute left-1/2 top-0 hidden -translate-x-1/2 lg:block" />
      </div>

      <Container>
        <Reveal>
          <BodyText className="mx-auto mt-10 text-center lg:mt-[7.6vw]  lg:max-w-[36vw]">
            Our team of experienced healthcare professionals is dedicated to
            delivering compassionate, personalized, and evidence-based care.
            With expertise across multiple specialties, we work together to
            support your health and wellbeing at every stage of life.
          </BodyText>
        </Reveal>
      </Container>
    </section>
  );
}
