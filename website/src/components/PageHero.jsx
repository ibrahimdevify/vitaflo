import Navbar from "./Navbar.jsx";
import Pulse from "./Pulse.jsx";
import GridBackdrop from "./ui/GridBackdrop.jsx";

export default function PageHero({ title, tagline, since = "2017", children }) {
  return (
    <section className="hero-bg relative overflow-clip">
      <GridBackdrop />
      <Navbar />

      <div className="relative z-10 px-6 lg:px-[12%]">
        <h1 className="mt-10 select-none text-center text-[17vw] font-normal uppercase leading-[.9] tracking-[-0.03em] text-white lg:mt-[7.4vw] lg:text-[11.9vw]">
          {title}
        </h1>

        <div className="mt-4 flex items-center gap-4 text-[clamp(14px,0.83vw,24px)] text-white lg:mt-[1.2vw] lg:gap-[1.3vw]">
          <span className="whitespace-nowrap">{tagline}</span>
          <span className="h-px flex-1 bg-white/45" />
          <span className="flex items-center gap-[0.9vw] whitespace-nowrap">
            Since <Pulse /> {since}
          </span>
        </div>
      </div>

      {children}
    </section>
  );
}
