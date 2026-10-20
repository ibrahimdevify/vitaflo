import { Link } from "react-router-dom";
import Container from "../ui/Container.jsx";
import Reveal from "../ui/Reveal.jsx";

// Three round-icon benefits, then a short note and a Contact button.
export default function ProductBenefits({ title, items, note, button = "Contact Us" }) {
  return (
    <section className="bg-white py-16 text-center lg:py-[7vw]">
      <Container>
        <Reveal>
          <h2 className="m-0 text-[clamp(24px,2.4vw,60px)] font-medium text-[#2c4d77]">
            {title}
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-10 sm:grid-cols-3 lg:mt-[4vw] lg:gap-[3vw]">
          {items.map(({ Icon, text }, i) => (
            <Reveal key={text} delay={i * 0.08}>
              <div className="mx-auto flex h-[clamp(96px,10vw,240px)] w-[clamp(96px,10vw,240px)] items-center justify-center rounded-full border-[3px] border-[#3a95f0] bg-[#f3f9fe]">
                <Icon
                  aria-hidden="true"
                  strokeWidth={1.8}
                  className="h-[40%] w-[40%] text-[#3a95f0]"
                />
              </div>
              <p className="mx-auto m-0 mt-6 max-w-[28ch] text-[clamp(15px,1.2vw,30px)] leading-[1.4] text-[#2c4d77] lg:mt-[2vw]">
                {text}
              </p>
            </Reveal>
          ))}
        </div>

        {note && (
          <Reveal className="mt-14 lg:mt-[6vw]">
            <h3 className="mx-auto m-0 max-w-[34ch] text-[clamp(20px,1.8vw,46px)] font-medium text-[#2c4d77]">
              {note}
            </h3>
            <Link
              to="/contact"
              className="mt-6 inline-flex items-center rounded-full bg-[#2c4d77] px-[clamp(24px,2.2vw,56px)] py-[clamp(12px,1vw,26px)] text-[clamp(14px,1vw,24px)] text-lime-vc transition-opacity hover:opacity-90 lg:mt-[2vw]"
            >
              {button}
            </Link>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
