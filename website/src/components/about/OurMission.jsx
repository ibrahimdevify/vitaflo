import Container from "../ui/Container.jsx";
import Tag from "../ui/Tag.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import BodyText from "../ui/BodyText.jsx";
import Photo from "../ui/Photo.jsx";
import Reveal from "../ui/Reveal.jsx";

// Photo: put it in src/assets/about/ and name it "mission" (png/jpg/webp).
// If it isn't there, the blog photo "technology" is used instead.
const photos = import.meta.glob(
  "../../assets/{about,blog}/*.{png,jpg,jpeg,webp}",
  { eager: true, import: "default" },
);
const find = (name) =>
  Object.entries(photos).find(([path]) =>
    new RegExp(`/${name}\\.[a-z]+$`).test(path),
  )?.[1] ?? null;
const missionPhoto = find("mission") ?? find("technology");

const MISSION_POINTS = [
  "Designing world class, easy-to-use solutions",
  "Building successful partnerships with our clients",
  "Driving outcomes through clinical advancement",
  "Bringing thoughtful innovation to market",
];

export default function OurMission() {
  return (
    <section
      id="our-mission"
      className="bg-[#faf8f4] py-16 lg:pb-[7.8vw] lg:pt-[7.75vw]"
    >
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_40.3vw] lg:gap-0">
          <Reveal>
            <Tag>OUR MISSION</Tag>
            <SectionHeading className="mt-4 lg:mt-[1vw] lg:max-w-[30vw] lg:text-[clamp(28px,3.6vw,98px)]">
              Proactive Respiratory Care
            </SectionHeading>
            <BodyText size="lg" className="mt-4 lg:mt-[1.2vw] lg:max-w-[28vw]">
              We transform the delivery of respiratory care by:
            </BodyText>
            <ol className="m-0 mt-3 list-decimal pl-6 lg:mt-[0.8vw] lg:max-w-[28vw] lg:pl-[1.9vw]">
              {MISSION_POINTS.map((point) => (
                <li
                  key={point}
                  className="py-1 text-[clamp(16px,1vw,26px)] leading-[1.8] text-[#111] marker:text-[#111] lg:py-[0.3vw]"
                >
                  {point}
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal y={60} scale={0.97} delay={0.1}>
            {missionPhoto ? (
              <Photo
                src={missionPhoto}
                alt="Clinician reviewing the VitalFlo platform on a laptop"
                className="aspect-[806/590]"
              />
            ) : (
              <div className="aspect-[806/590] rounded-[clamp(16px,1.3vw,32px)] bg-[#4a6f9a]" />
            )}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
