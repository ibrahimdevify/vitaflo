import Container from "./ui/Container.jsx";
import Tag from "./ui/Tag.jsx";
import SectionHeading from "./ui/SectionHeading.jsx";
import BodyText from "./ui/BodyText.jsx";
import Photo from "./ui/Photo.jsx";
import Reveal from "./ui/Reveal.jsx";
import team from "../assets/team.png";
import care from "../assets/care.png";
import consult from "../assets/consult.png";

export default function About() {
  return (
    <section
      id="about"
      className="bg-[#faf8f4] py-16 lg:pb-[7.2vw] lg:pt-[7.8vw]"
    >
      <Container>
        <div className="relative lg:h-[43.4vw]">
          <Reveal className="mx-auto flex flex-col items-center text-center lg:max-w-[36vw]">
            <Tag>ABOUT US</Tag>
            <SectionHeading className="mt-4 lg:mt-[1vw]">
              Healthcare Designed Around You
            </SectionHeading>
            <BodyText className="mt-4 lg:mt-[1.4vw] lg:max-w-[26.5vw]">
              We believe great healthcare goes beyond treatment. Our
              patient-first approach combines expertise, technology, and
              personalized care to help you feel your best at every stage of
              life.
            </BodyText>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-4 lg:mt-0 lg:block">
            <Reveal
              y={70}
              scale={0.96}
              delay={0.1}
              className="lg:absolute lg:left-0 lg:top-[19.5vw] lg:w-[17.5vw]"
            >
              <Photo
                src={team}
                alt="Medical team walking through a hospital corridor"
                className="aspect-[424/523]"
              />
            </Reveal>

            <Reveal
              y={70}
              scale={0.96}
              delay={0.25}
              className="lg:absolute lg:right-0 lg:top-[13.1vw] lg:w-[17.5vw]"
            >
              <Photo
                src={care}
                alt="Nurse caring for an elderly patient in a wheelchair"
                className="aspect-[424/522]"
              />
            </Reveal>

            <Reveal
              y={70}
              scale={0.96}
              delay={0.4}
              className="col-span-2 lg:absolute lg:left-[32.4vw] lg:top-[30.3vw] lg:w-[17.5vw]"
            >
              <Photo
                src={consult}
                alt="Doctor talking with a patient"
                className="aspect-[424/315]"
              />
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
