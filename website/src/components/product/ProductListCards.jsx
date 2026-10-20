import Container from "../ui/Container.jsx";
import Reveal from "../ui/Reveal.jsx";

// Outlined cards with an icon, a title and a few short lines (left aligned).
export default function ProductListCards({ title, items }) {
  return (
    <section className="bg-[#faf9f7] py-16 lg:py-[7vw]">
      <Container>
        <Reveal>
          <h2 className="m-0 text-center text-[clamp(24px,2.4vw,60px)] font-medium text-[#2c4d77]">
            {title}
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-[3.5vw] lg:grid-cols-3 lg:gap-[1.6vw]">
          {items.map(({ Icon, title: t, lines }, i) => (
            <Reveal key={t} delay={(i % 3) * 0.08} className="h-full">
              <div className="h-full rounded-[clamp(16px,1.3vw,32px)] border-2 border-[#2c4d77]/70 bg-white p-7 lg:p-[2.2vw]">
                <Icon
                  aria-hidden="true"
                  strokeWidth={1.6}
                  className="h-[clamp(36px,3.4vw,84px)] w-[clamp(36px,3.4vw,84px)] text-[#2c4d77]"
                />
                <h3 className="m-0 mt-5 text-[clamp(18px,1.4vw,36px)] font-medium text-[#2c4d77] lg:mt-[1.6vw]">
                  {t}
                </h3>
                <ul className="m-0 mt-3 list-none p-0 lg:mt-[1vw]">
                  {lines.map((l) => (
                    <li
                      key={l}
                      className="mt-2 text-[clamp(14px,1.05vw,26px)] leading-[1.45] text-[#1f2d3d] lg:mt-[0.7vw]"
                    >
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
