import PageHero from "../components/PageHero.jsx";
import Container from "../components/ui/Container.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import BodyText from "../components/ui/BodyText.jsx";
import Divider from "../components/ui/Divider.jsx";
import DotLabel from "../components/ui/DotLabel.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import JobsGrid from "../components/career/JobsGrid.jsx";
import Contact from "../components/Contact.jsx";
import Footer from "../components/Footer.jsx";
import { CAREER_JOBS } from "../data/jobs.js";
import Faq from "../components/Faq.jsx";
export default function Career() {
  return (
    <>
      <PageHero title="Career" tagline="Join VitalFlo Healthcare">
        {/* Heading (left) + intro paragraph (right), inside the blue hero */}
        <Container className="relative z-10 pb-16 pt-10 lg:pb-[4.4vw] lg:pt-[5vw]">
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-[1fr_24.9vw] lg:gap-0">
              <SectionHeading
                tone="light"
                className="text-white lg:max-w-[36vw]"
              >
                Help Us Transform Respiratory Care
              </SectionHeading>
              <BodyText
                tone="light"
                size="lg"
                className="lg:pt-[0.6vw] lg:text-[clamp(18px,1.24vw,32px)] lg:leading-[1.5]"
              >
                {
                  "We're building proactive respiratory care technology for people living with asthma and COPD. If you're passionate about making a meaningful impact in patients' lives, we'd love to hear from you."
                }
              </BodyText>
            </div>
          </Reveal>
        </Container>
      </PageHero>

      {/* Open positions */}
      <section
        id="open-positions"
        className="bg-[#faf8f4] pb-16 pt-12 lg:pb-[7.8vw] lg:pt-[7.7vw]"
      >
        <Container>
          <Divider on="light" />
          <DotLabel className="mt-4 lg:mt-[0.95vw]">Open Positions</DotLabel>
        </Container>

        <div className="mt-8 lg:mt-[3.8vw]">
          <JobsGrid jobs={CAREER_JOBS} />
        </div>
      </section>
      <Faq />
      <Contact />
      <Footer />
    </>
  );
}
