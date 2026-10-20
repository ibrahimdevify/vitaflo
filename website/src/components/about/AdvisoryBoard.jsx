import Container from "../ui/Container.jsx";
import Tag from "../ui/Tag.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import Reveal from "../ui/Reveal.jsx";
import { ADVISORS, aboutImage } from "../../data/advisors.js";

const initials = (name) =>
  name
    .replace(/^Dr\.\s*/, "")
    .split(/[ ,]+/)
    .filter((w) => /^[A-Z][a-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

function Advisor({ advisor }) {
  const src = aboutImage(advisor.photo);
  return (
    <article className="flex w-full flex-col items-center text-center">
      <div className="grid h-[44vw] w-[44vw] max-h-[200px] max-w-[200px] place-items-center overflow-hidden rounded-full bg-[#4a6f9a] ring-2 ring-[#4a6f9a] ring-offset-[6px] ring-offset-[#faf8f4] lg:h-[9.2vw] lg:w-[9.2vw] lg:max-h-none lg:max-w-none">
        {src ? (
          <img
            src={src}
            alt={advisor.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[clamp(24px,2.4vw,60px)] text-white">
            {initials(advisor.name)}
          </span>
        )}
      </div>
      <h3 className="mt-5 text-[clamp(17px,1.3vw,32px)] font-normal leading-tight text-[#2c4d77] lg:mt-[1.6vw]">
        {advisor.name}
      </h3>
      <ul className="m-0 mt-2 list-none p-0 lg:mt-[0.7vw]">
        {advisor.lines.map((l) => (
          <li
            key={l}
            className="text-[clamp(13px,0.85vw,22px)] leading-[1.5] text-[#111]"
          >
            {l}
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function AdvisoryBoard() {
  return (
    <section id="advisory-board" className="bg-[#faf8f4] pb-16 lg:pb-[7.8vw]">
      <Container>
        <Reveal className="flex flex-col items-center text-center">
          <Tag>ADVISORS</Tag>
          <SectionHeading className="mt-4 lg:mt-[1vw] lg:text-[clamp(28px,3.8vw,98px)]">
            Clinical Advisory Board
          </SectionHeading>
        </Reveal>

        <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-12 lg:mt-[4.5vw] lg:gap-x-[2.25vw] lg:gap-y-[4.5vw]">
          {ADVISORS.map((a, i) => (
            <Reveal
              key={a.name}
              y={50}
              delay={(i % 3) * 0.08}
              className="flex w-full justify-center sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5vw)]"
            >
              <Advisor advisor={a} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
