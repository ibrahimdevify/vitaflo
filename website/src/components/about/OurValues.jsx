import Container from "../ui/Container.jsx";
import Tag from "../ui/Tag.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import Reveal from "../ui/Reveal.jsx";
import { aboutImage } from "../../data/advisors.js";

// Photo: put a round-friendly team collage in src/assets/about/ named "values".
const VALUES = [
  "Be Courageous",
  "Focus on Results",
  "Seek out Growth",
  "Be Helpful",
  "Maximize Impact",
  "Reduce Complexity",
];

export default function OurValues() {
  const photo = aboutImage("values");

  return (
    <section
      id="our-values"
      className="bg-[#faf8f4] pb-16 lg:pb-[7.8vw] lg:pt-0"
    >
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[29vw_1fr] lg:gap-[6vw]">
          <Reveal y={60} scale={0.97}>
            <div className="mx-auto aspect-square w-[78vw] max-w-[420px] overflow-hidden rounded-full bg-[#4a6f9a] lg:w-full lg:max-w-none">
              {photo && (
                <img
                  src={photo}
                  alt="The VitalFlo team"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Tag>CORE VALUES</Tag>
            <SectionHeading className="mt-4 lg:mt-[1vw] lg:text-[clamp(28px,3.8vw,98px)]">
              Our Team Commits To
            </SectionHeading>
            <ol className="m-0 mt-4 list-decimal pl-6 lg:mt-[1.2vw] lg:pl-[1.9vw]">
              {VALUES.map((v) => (
                <li
                  key={v}
                  className="py-1 text-[clamp(16px,1.1vw,28px)] leading-[1.8] text-[#111] marker:text-[#111] lg:py-[0.35vw]"
                >
                  {v}
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
