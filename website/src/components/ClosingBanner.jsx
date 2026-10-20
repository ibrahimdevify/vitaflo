import { CalendarDays } from "lucide-react";
import Container from "./ui/Container.jsx";
import BigWord from "./ui/BigWord.jsx";
import Reveal from "./ui/Reveal.jsx";

// Put the corridor photo in src/assets/banner/ and name it "team-corridor"
// (png / jpg / jpeg / webp). Without it the panel shows plain blue.
const photos = import.meta.glob("../assets/banner/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});
const photo =
  Object.entries(photos).find(([path]) =>
    /\/team-corridor\.[a-z]+$/.test(path),
  )?.[1] ?? null;

export default function ClosingBanner() {
  return (
    <section
      id="get-started"
      className="hero-bg relative overflow-hidden py-16 text-white lg:pb-[7.7vw] lg:pt-[9.5vw]"
    >
      <div
        aria-hidden="true"
        className="hero-grid pointer-events-none absolute inset-0 opacity-70"
      />
      <Container className="relative">
        <Reveal>
          <BigWord>VITALFLO</BigWord>

          <div className="mt-6 flex flex-col gap-4 text-[clamp(14px,0.93vw,24px)] sm:flex-row sm:items-center sm:justify-between lg:mt-[5.9vw]">
            <div className="flex items-center gap-[1vw]">
              <span>Take the First Step Toward Better Health</span>
              <span
                aria-hidden="true"
                className="hidden h-px w-[13vw] bg-gradient-to-r from-white/70 to-transparent lg:block"
              />
            </div>
            <div className="flex items-center gap-[1vw]">
              <span
                aria-hidden="true"
                className="hidden h-px w-[11.5vw] bg-gradient-to-l from-white/70 to-transparent lg:block"
              />
              <a
                href="#contact"
                className="flex items-center gap-3 transition-opacity hover:opacity-80 lg:gap-[1vw]"
              >
                Schedule
                <CalendarDays
                  className="h-[clamp(20px,1.3vw,32px)] w-[clamp(20px,1.3vw,32px)] text-lime-vc"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                Consultation
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-8 aspect-[1524/671] overflow-hidden bg-[#4a6f9a] lg:mt-[5.6vw]">
            {photo && (
              <img
                src={photo}
                alt="VitalFlo care team walking through a hospital corridor"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
