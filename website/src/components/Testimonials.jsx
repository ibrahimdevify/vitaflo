import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Container from "./ui/Container.jsx";
import Tag from "./ui/Tag.jsx";
import SectionHeading from "./ui/SectionHeading.jsx";
import Reveal from "./ui/Reveal.jsx";
import TestimonialCard from "./testimonial/TestimonialCard.jsx";
import { TESTIMONIALS } from "../data/testimonials.js";

gsap.registerPlugin(ScrollTrigger);

// Desktop: cards are scattered at fixed spots (in vw) while the heading
// stays pinned behind them. Mobile: a plain stacked list.
const SPOTS = [
  "lg:absolute lg:left-[18.75vw] lg:top-0",
  "lg:absolute lg:left-[62.5vw] lg:top-[17vw]",
  "lg:absolute lg:left-[30.2vw] lg:top-[29.8vw]",
  "lg:absolute lg:left-[58.2vw] lg:top-[44.4vw]",
];

export default function Testimonials() {
  const headingRef = useRef(null);
  const cardsRef = useRef(null);

  // Fade the pinned heading as the cards scroll over it.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      gsap.to(headingRef.current, {
        opacity: 0.2,
        ease: "none",
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 80%",
          end: "top 10%",
          scrub: true,
        },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="testimonials" className="testimonial-bg">
      <div
        ref={headingRef}
        className="flex flex-col items-center px-6 py-16 text-center lg:sticky lg:top-0 lg:h-screen lg:justify-center lg:py-0"
      >
        <Reveal className="flex flex-col items-center">
          <Tag tone="glass">TESTIMONIAL</Tag>
          <SectionHeading
            tone="light"
            className="mt-4 lg:mt-[1vw] lg:max-w-[46vw]"
          >
            Trusted by Clinicians, Loved by Care Teams
          </SectionHeading>
        </Reveal>
      </div>

      <div ref={cardsRef} className="relative z-10 lg:-mt-[16vh] lg:h-[70vw]">
        <Container className="lg:hidden">
          <ul className="m-0 flex list-none flex-col gap-4 p-0 pb-16">
            {TESTIMONIALS.map((t) => (
              <li key={t.name}>
                <TestimonialCard {...t} />
              </li>
            ))}
          </ul>
        </Container>

        <ul className="m-0 hidden list-none p-0 lg:block">
          {TESTIMONIALS.map((t, i) => (
            <li key={t.name}>
              <Reveal className={`${SPOTS[i]} lg:w-[18.7vw]`}>
                <TestimonialCard {...t} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
