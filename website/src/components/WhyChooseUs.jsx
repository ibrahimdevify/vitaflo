import Container from "./ui/Container.jsx";
import Tag from "./ui/Tag.jsx";
import SectionHeading from "./ui/SectionHeading.jsx";
import BodyText from "./ui/BodyText.jsx";
import Reveal from "./ui/Reveal.jsx";
import platform from "../assets/spirometry.webp";

export default function WhyChooseUs() {
  return (
    <section
      id="why-choose-us"
      className="bg-[#faf8f4] pb-16 pt-4 lg:pb-[9vw] lg:pt-[7.2vw]"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_32.2vw] lg:gap-0">
          <Reveal>
            <Tag>WHY CHOOSE US</Tag>
            <SectionHeading className="mt-4 lg:mt-[1vw] lg:max-w-[28vw]">
              One Solution for Quality Spirometry
            </SectionHeading>

            <div className="mt-8 lg:mt-[4.5vw]">
              <h3 className="text-[clamp(17px,1.15vw,28px)] font-normal text-[#0f0f0f]">
                Clinical Decision Support
              </h3>
              <BodyText className="mt-2 lg:mt-[0.4vw] lg:max-w-[26vw]">
                With robust analytics tools, automated alerts and detailed
                ATS/ERS compliant reporting, VitalFlo enables proactive care.
                And with spirometry workflows built for mobile devices, it
                supports every care setting: in-office, bedside, and at home.
              </BodyText>
            </div>
          </Reveal>

          <div>
            <Reveal delay={0.1}>
              <BodyText className="lg:max-w-[24vw]">
                Spirometry is only valuable when it is done well and done
                consistently. VitalFlo&apos;s platform makes it easy, with
                workflows for remote monitoring and in-office visits that keep
                you on top of your patients&apos; lung health.
              </BodyText>
            </Reveal>

            <Reveal y={60} scale={0.97} className="mt-6 lg:mt-[2.4vw]">
              <img
                src={platform}
                alt="VitalFlo platform on tablet and phone"
                loading="lazy"
                className="block h-auto w-full"
              />
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
