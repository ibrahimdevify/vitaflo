import Container from "../ui/Container.jsx";
import Reveal from "../ui/Reveal.jsx";
import Rich from "./Rich.jsx";
import { PRACTICE_FEATURES, practicePhoto } from "../../data/practice.js";

// Three rows on a big white panel: text and illustration swap sides each row.
export default function PracticeFeatures() {
  return (
    <section className="bg-[#faf8f4] py-16 lg:py-[7.8vw]">
      <Container>
        <div className="rounded-[clamp(20px,2vw,48px)] bg-white px-6 py-12 lg:px-[4.3vw] lg:py-[5vw]">
          {PRACTICE_FEATURES.map((f, i) => {
            const src = practicePhoto(f.image);
            const flip = i % 2 === 1;
            return (
              <Reveal key={f.title} y={50}>
                <article
                  className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-[4vw] ${
                    i ? "mt-14 lg:mt-[8vw]" : ""
                  }`}
                >
                  <div className={flip ? "lg:order-2" : ""}>
                    <p className="m-0 text-[clamp(14px,1.1vw,28px)] uppercase tracking-[0.04em] text-[#2c4d77]">
                      {f.eyebrow}
                    </p>
                    <h2 className="m-0 mt-3 text-[clamp(26px,2.8vw,72px)] font-normal leading-[1.15] tracking-[-0.02em] text-[#0f0f0f] lg:mt-[0.9vw]">
                      {f.title}
                    </h2>
                    <p className="m-0 mt-4 text-[clamp(16px,1.1vw,28px)] leading-[1.6] text-[#0f0f0f]/80 lg:mt-[1.3vw] lg:max-w-[36vw]">
                      <Rich>{f.text}</Rich>
                    </p>
                  </div>

                  <div
                    className={`flex justify-center ${flip ? "lg:order-1" : ""}`}
                  >
                    {src ? (
                      <img
                        src={src}
                        alt=""
                        loading="lazy"
                        className="block h-auto w-[min(64vw,300px)] lg:w-[15vw]"
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="aspect-square w-[min(64vw,300px)] rounded-full bg-[#e6e6e6] lg:w-[15vw]"
                      />
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
