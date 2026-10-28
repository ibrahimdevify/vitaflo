import PageHero from "../components/PageHero.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import BodyText from "../components/ui/BodyText.jsx";
import DotLabel from "../components/ui/DotLabel.jsx";
import Photo from "../components/ui/Photo.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import MarqueeTrack from "../components/ui/MarqueeTrack.jsx";
import MilestoneCard from "../components/about/MilestoneCard.jsx";
import { MILESTONES } from "../data/milestones.js";
import OurMission from "../components/about/OurMission.jsx";
import AboutIntro from "../components/about/AboutIntro.jsx";
import Team from "../components/Team.jsx";
import Faq from "../components/Faq.jsx";

import Blog from "../components/Blog.jsx";
import ClosingBanner from "../components/ClosingBanner.jsx";
import Contact from "../components/Contact.jsx";
import Footer from "../components/Footer.jsx";
import AdvisoryBoard from "../components/about/AdvisoryBoard.jsx";
export default function About() {
  return (
    <PageHero title="About Us" tagline="About VitalFlo Healthcare">
      <div className="relative z-10 grid grid-cols-[minmax(0,1fr)] px-6 pt-8 lg:grid-cols-[35.7vw_1fr] lg:px-[12%] lg:pt-[2.7vw]">
        {/* Left: sticky image */}
        <div className="min-w-0">
          <div className="lg:sticky lg:top-[2.4vw]">
            <Reveal>
              <Photo
                src={`${import.meta.env.BASE_URL}about/intro.webp`}
                alt="Doctor examining a patient"
                className="aspect-[583/413] w-full lg:w-[24.1vw]"
              />
            </Reveal>
          </div>
        </div>

        {/* Right: content with divider */}
        <div className="mt-10 min-w-0 border-l border-white/70 pb-12 pl-5 lg:mt-0 lg:pb-[7.7vw] lg:pl-[1.24vw]">
          <Reveal>
            <BodyText
              tone="light"
              className="max-lg:!text-[17px] max-lg:!leading-[1.9] lg:max-w-[23.5vw]"
            >
              VitalFlo was founded in Raleigh, NC in 2017 to improve the
              experience of people living with chronic respiratory disease by
              changing how preventative care is delivered. Our platform connects
              patients and providers, from in-office testing to remote patient
              monitoring.
            </BodyText>
          </Reveal>

          <Reveal className="mt-12 lg:mt-[7.7vw]">
            <SectionHeading
              tone="light"
              className="max-lg:!text-[36px] max-lg:!leading-[1.15] lg:max-w-[32vw]"
            >
              Transforming Respiratory Care Through Technology
            </SectionHeading>
            <BodyText
              tone="light"
              size="lg"
              className="mt-5 max-lg:!text-[17px] max-lg:!leading-[1.9] lg:mt-[2.4vw] lg:max-w-[23.5vw]"
            >
              We combine clinical expertise with in-office spirometry, remote
              patient monitoring and clinical decision support, so providers can
              step in before problems grow.
            </BodyText>
          </Reveal>

          <Reveal className="mt-12 lg:mt-[8vw]">
            <DotLabel tone="light">Key Milestones</DotLabel>
            <MarqueeTrack
              duration={45}
              className="edge-fade mt-4 lg:mt-[1.5vw]"
            >
              {MILESTONES.map((m) => (
                <MilestoneCard
                  key={`${m.year}-${m.text}`}
                  year={m.year}
                  text={m.text}
                />
              ))}
            </MarqueeTrack>
          </Reveal>
        </div>
      </div>
      <OurMission />
      <AdvisoryBoard />
      <AboutIntro />
      <Team />
      <Faq />

      <Blog />
      <ClosingBanner />
      <Contact />
      <Footer />
    </PageHero>
  );
}
