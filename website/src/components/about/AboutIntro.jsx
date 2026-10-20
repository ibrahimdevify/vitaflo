import Container from "../ui/Container.jsx";
import Tag from "../ui/Tag.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import BodyText from "../ui/BodyText.jsx";
import Reveal from "../ui/Reveal.jsx";
import StatCard from "./StatCard.jsx";
import { ABOUT_PHOTOS, ABOUT_STATS } from "../../data/about.js";

const PARA = "lg:text-[clamp(15px,0.93vw,24px)]";

function PhotoCard({ src, alt }) {
  return (
    <div className="relative h-full min-h-[260px] overflow-hidden rounded-[clamp(16px,1.2vw,30px)] bg-[#4a6f9a] lg:min-h-0">
      {src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#3d6087]/65 via-[#3d6087]/15 to-transparent"
      />
    </div>
  );
}

export default function AboutIntro() {
  return (
    <section
      id="about-intro"
      className="bg-[#faf8f4] pb-16 lg:pb-[7.8vw] lg:pt-0"
    >
      <Container>
        <Reveal className="mx-auto flex flex-col items-center text-center">
          <Tag>ABOUT US</Tag>
          <SectionHeading className="mt-4 lg:mt-[1vw] lg:max-w-[36vw] lg:text-[clamp(28px,3.8vw,98px)]">
            A Smarter Approach to Respiratory Care
          </SectionHeading>
          <BodyText
            size="lg"
            className={`mt-4 lg:mt-[1.2vw] lg:max-w-[36vw] ${PARA}`}
          >
            VitalFlo is a digital health company specializing in proactive
            respiratory care. Our platform helps providers test, monitor and
            track patients with asthma and COPD across hospitals, ACOs and group
            practices.
          </BodyText>
          <BodyText
            size="lg"
            className={`mt-6 lg:mt-[1.5vw] lg:max-w-[36vw] ${PARA}`}
          >
            Better lung health starts with catching problems early.
          </BodyText>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-[8.4vw] lg:grid-cols-3 lg:grid-rows-[19.1vw_16.55vw] lg:gap-x-[1.8vw] lg:gap-y-[3.8vw]">
          <Reveal y={50} className="h-full">
            <StatCard {...ABOUT_STATS.founded} tone="mid" />
          </Reveal>
          <Reveal y={50} delay={0.1} className="h-full">
            <PhotoCard {...ABOUT_PHOTOS.patient} />
          </Reveal>
          <Reveal y={50} delay={0.2} className="h-full">
            <StatCard {...ABOUT_STATS.funding} tone="deep" />
          </Reveal>

          <Reveal y={50} className="h-full">
            <PhotoCard {...ABOUT_PHOTOS.records} />
          </Reveal>
          <Reveal
            y={50}
            delay={0.1}
            className="h-full sm:col-span-2 lg:col-span-2"
          >
            <StatCard {...ABOUT_STATS.solutions} tone="light" />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
