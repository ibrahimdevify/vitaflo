import Container from "../ui/Container.jsx";
import Reveal from "../ui/Reveal.jsx";
import BodyText from "../ui/BodyText.jsx";

// Grid of outlined feature cards (icon, title, short text).
export default function ProductCards({ items }) {
  return (
    <section className="bg-[#faf9f7] py-16 lg:py-[7vw]">
      <Container>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[1.6vw]">
          {items.map(({ title, text, Icon }, i) => (
            <Reveal key={title} delay={(i % 3) * 0.08} className="h-full">
              <div className="flex h-full flex-col items-center rounded-[clamp(16px,1.3vw,32px)] border-2 border-[#2c4d77]/70 bg-white px-6 py-10 text-center lg:px-[2vw] lg:py-[3vw]">
                <Icon
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="h-[clamp(40px,3.6vw,88px)] w-[clamp(40px,3.6vw,88px)] text-[#2c4d77]"
                />
                <h3 className="m-0 mt-5 text-[clamp(20px,1.7vw,42px)] font-medium text-[#2c4d77] lg:mt-[1.4vw]">
                  {title}
                </h3>
                <BodyText className="mt-3 max-w-[30ch] lg:mt-[1vw]">
                  {text}
                </BodyText>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
