import Container from "../ui/Container.jsx";
import Button from "../ui/Button.jsx";
import Reveal from "../ui/Reveal.jsx";
import {
  PRACTICE_TESTIMONIALS,
  PRACTICE_TESTIMONIALS_INTRO as INTRO,
  practicePhoto,
} from "../../data/practice.js";

// Blue band with the four customer quote cards (2 x 2).
export default function PracticeTestimonials() {
  return (
    <section className="bg-[#35577c] py-16 text-white lg:py-[7vw]">
      <Container>
        <Reveal className="text-center">
          <h2 className="m-0 text-[clamp(28px,3.4vw,88px)] font-normal uppercase leading-[1.1] tracking-[-0.02em]">
            {INTRO.heading}
          </h2>
          <p className="m-0 mt-3 text-[clamp(16px,1.5vw,38px)] text-white/90 lg:mt-[1vw]">
            {INTRO.text}
          </p>
        </Reveal>

        <ul className="m-0 mt-10 grid list-none gap-4 p-0 md:grid-cols-2 lg:mt-[3.4vw] lg:gap-[1.65vw]">
          {PRACTICE_TESTIMONIALS.map((t, i) => {
            const src = practicePhoto(t.photo);
            return (
              <li key={t.name}>
                <Reveal y={50} delay={(i % 2) * 0.08}>
                  <figure className="m-0 overflow-hidden rounded-[clamp(16px,1.6vw,40px)] bg-white text-[#0f0f0f]">
                    {src ? (
                      <img
                        src={src}
                        alt={`\u201c${t.quote}\u201d \u2013 ${t.name}, ${t.role}`}
                        width="1080"
                        height="750"
                        loading="lazy"
                        className="block h-auto w-full"
                      />
                    ) : (
                      // Picture missing: show the same testimonial as plain text
                      <div className="p-6 lg:p-[2.4vw]">
                        <blockquote className="m-0 text-[clamp(16px,1.4vw,36px)] leading-[1.5]">
                          {t.quote}
                        </blockquote>
                        <figcaption className="mt-5 lg:mt-[1.6vw]">
                          <span className="block text-[clamp(16px,1.3vw,32px)] font-semibold">
                            {t.name}
                          </span>
                          <span className="block text-[clamp(14px,0.95vw,24px)] text-[#0f0f0f]/70">
                            {t.role}
                          </span>
                        </figcaption>
                      </div>
                    )}
                  </figure>
                </Reveal>
              </li>
            );
          })}
        </ul>

        <Reveal className="mt-10 flex justify-center lg:mt-[3.5vw]">
          <Button href={INTRO.cta.href}>{INTRO.cta.label}</Button>
        </Reveal>
      </Container>
    </section>
  );
}
