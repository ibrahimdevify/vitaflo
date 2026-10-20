import Container from "./ui/Container.jsx";
import Tag from "./ui/Tag.jsx";
import SectionHeading from "./ui/SectionHeading.jsx";
import BodyText from "./ui/BodyText.jsx";
import Divider from "./ui/Divider.jsx";
import DotLabel from "./ui/DotLabel.jsx";
import Reveal from "./ui/Reveal.jsx";
import JobCarousel from "./career/JobCarousel.jsx";
import { JOBS } from "../data/jobs.js";

export default function Career() {
  return (
    <section id="career" className="bg-[#faf8f4] pb-16 lg:pb-[7.8vw]">
      <Container>
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-[1fr_24.9vw] lg:gap-0">
            <div>
              <Tag>CAREER</Tag>
              <SectionHeading className="mt-4 lg:mt-[1vw] lg:max-w-[36vw]">
                Join a Team That&apos;s Transforming Health
              </SectionHeading>
            </div>
            <BodyText size="lg" className="lg:pt-[4.75vw]">
              {
                "We're building the future of healthcare through innovation, compassion, and technology. If you're passionate about making a meaningful impact in people's lives, we'd love to hear from you."
              }
            </BodyText>
          </div>
        </Reveal>

        <Divider on="light" className="mt-8 lg:mt-[3vw]" />
        <DotLabel className="mt-4 lg:mt-[0.95vw]">Open Positions</DotLabel>
      </Container>

      <div className="mt-8 lg:mt-[3.4vw]">
        <JobCarousel jobs={JOBS} />
      </div>
    </section>
  );
}
