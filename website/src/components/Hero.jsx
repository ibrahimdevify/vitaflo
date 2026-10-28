import { useEffect, useRef } from "react";
import gsap from "gsap";
import heart from "../assets/lungs.webp";
import Navbar from "./Navbar.jsx";
import BigWord from "./ui/BigWord.jsx";
import Pulse from "./Pulse.jsx";
import Avatars from "./Avatars.jsx";
import Globe from "./Globe.jsx";
import DoctorCard from "./DoctorCard.jsx";
import dots from "../assets/dots.webp";
import RollText from "./ui/RollText.jsx";
const WORD = "VITALFLO";
const WORD_CLASS =
  "hero-word flex select-none justify-between text-[16vw] font-normal leading-[.9] lg:text-[13vw]";

function Letters() {
  return WORD.split("").map((c, i) => (
    <span key={i} aria-hidden="true">
      {c}
    </span>
  ));
}

export default function Hero() {
  const sectionRef = useRef(null);

  // Intro animation when the page loads.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from("header", {
          y: -24,
          opacity: 0,
          duration: 0.8,
          clearProps: "transform,opacity",
        })
        .from(
          ".hero-word span",
          {
            y: 70,
            opacity: 0,
            duration: 1,
            stagger: 0.06,
            clearProps: "transform,opacity",
          },
          "-=0.4",
        )
        .from(
          "[data-intro='fade']",
          { opacity: 0, duration: 1.2, clearProps: "opacity" },
          "-=0.8",
        )
        .from(
          "[data-intro='up']",
          {
            y: 40,
            opacity: 0,
            duration: 0.9,
            stagger: 0.15,
            clearProps: "transform,opacity",
          },
          "-=0.8",
        );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero-bg relative min-h-screen overflow-hidden"
    >
      <div
        className="grid-lines pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-repeat-y opacity-40"
        style={{ backgroundImage: `url(${dots})`, backgroundSize: "100% auto" }}
      />

      <Navbar />

      {/* Headline + lungs */}
      <div className="relative z-10 px-6 lg:px-[12%]">
        <div className="hero-stage relative mt-10 lg:mt-[7.7vw]">
          <h1 className="m-0 select-none text-white">
            <BigWord>VITALFLO</BigWord>
          </h1>

          {/* Lungs float below the headline (desktop) - they never touch it. */}
          <div
            data-intro="fade"
            className="heart pointer-events-none absolute left-1/2 top-1/2 z-20 hidden lg:top-[calc(100%+15.7vw)] lg:block"
          >
            <img
              src={heart}
              alt="Human lungs"
              width="900"
              height="1200"
              className="heart-img block h-[78vw] w-auto max-w-none lg:h-[27vw]"
            />
          </div>

          <a
            data-intro="fade"
            href="#services"
            className="group/roll absolute left-1/2 top-[calc(50%+39vw)] z-30 hidden h-[clamp(52px,3.9vw,100px)] -translate-x-1/2 items-center whitespace-nowrap rounded-full bg-lime-vc px-[clamp(22px,1.43vw,40px)] text-[clamp(16px,0.97vw,26px)] text-ink-vc shadow-lg transition hover:brightness-105 lg:top-[calc(50%+29.8vw)] lg:flex"
          >
            <RollText>Explore Services</RollText>
          </a>
        </div>
      </div>

      {/* Tagline row */}
      <div data-intro="up" className="relative z-10 px-6 lg:px-[12.6%]">
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[clamp(14px,0.78vw,22px)] lg:mt-[1.4vw] lg:flex-nowrap">
          <span className="whitespace-nowrap">
            Proactive respiratory care platform.
          </span>
          <span className="mx-1 hidden h-px flex-1 bg-gradient-to-r from-white/40 to-white/10 sm:block lg:mx-[1.25vw]" />
          <span className="flex items-center gap-[1.1vw] whitespace-nowrap">
            Since <Pulse /> 2017
          </span>
        </div>
      </div>

      {/* Mobile only: lungs + button sit in the flow, below the tagline */}
      <div
        data-intro="up"
        className="relative z-10 mt-6 flex flex-col items-center px-6 lg:hidden"
      >
        <img
          src={heart}
          alt="Human lungs"
          width="900"
          height="1200"
          className="heart-img block h-[105vw] max-h-[620px] w-auto max-w-none"
        />
        <a
          href="#services"
          className="group/roll -mt-6 flex h-[52px] items-center whitespace-nowrap rounded-full bg-lime-vc px-[26px] text-[17px] text-ink-vc shadow-lg transition hover:brightness-105"
        >
          <RollText>Explore Services</RollText>
        </a>
      </div>

      {/* Bottom row */}
      <div
        data-intro="up"
        className="relative z-10 mt-10 px-6 pb-14 lg:mt-[30vw] lg:px-[12.6%] lg:pb-[2.8vw]"
      >
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-end lg:gap-0">
          {/* Left column */}
          <div className="flex flex-col items-center lg:-ml-[1vw] lg:w-[14.4vw]">
            <Avatars className="lg:-translate-x-[0.4vw]" />
            <div className="relative mt-5 h-12 w-px bg-white/40 lg:mt-[1.7vw] lg:h-[2.9vw]">
              <span className="absolute -top-[3px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white" />
            </div>
            <div className="mt-4 flex items-center whitespace-nowrap rounded-full bg-white/15 px-[clamp(20px,1.45vw,40px)] py-3 text-[clamp(15px,0.83vw,22px)] backdrop-blur lg:mt-[1.3vw] lg:h-[3.2vw] lg:py-0">
              Test, monitor, and track.
            </div>
          </div>

          <DoctorCard className="lg:ml-[12.6vw]" />

          {/* Right column */}
          <div className="flex flex-col items-center text-center lg:-mt-[8.2vw] lg:ml-[3.5vw] lg:w-[17vw] lg:self-start">
            <p className="text-[clamp(22px,1.53vw,40px)] font-light leading-[1.6] lg:whitespace-nowrap">
              Care in any
              <br />
              setting
            </p>
            <div className="relative mt-3 h-12 w-px bg-white/40 lg:mt-[0.4vw] lg:h-[2.8vw]">
              <span className="absolute -bottom-[3px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white" />
            </div>
            <Globe className="mt-4 w-[clamp(80px,5.1vw,130px)] lg:mt-[1.2vw]" />
            <a
              href="#about"
              className="group/roll mt-3 text-[clamp(15px,0.76vw,20px)] text-lime-vc lg:mt-[0.6vw]"
            >
              <RollText>Learn More</RollText>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
