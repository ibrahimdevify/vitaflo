import Navbar from "../Navbar.jsx";
import GridBackdrop from "../ui/GridBackdrop.jsx";
import Container from "../ui/Container.jsx";
import Reveal from "../ui/Reveal.jsx";

// Same look as the Terms / Privacy hero, used by the Help Center pages.
export default function HelpHero({ eyebrow, title, children }) {
  return (
    <section className="hero-bg relative overflow-hidden pb-14 text-white lg:pb-[6vw]">
      <GridBackdrop />
      <Navbar />
      <Container className="relative z-10">
        <Reveal y={40} className="mt-10 lg:mt-[5vw]">
          {eyebrow && (
            <p className="m-0 mb-3 text-[clamp(13px,0.9vw,22px)] uppercase tracking-wide text-lime-vc lg:mb-[1vw]">
              {eyebrow}
            </p>
          )}
          <h1 className="m-0 text-[clamp(34px,4.4vw,110px)] font-normal leading-[1.1] tracking-[-0.025em]">
            {title}
          </h1>
          {children && (
            <p className="m-0 mt-4 max-w-[640px] text-[clamp(15px,1.1vw,26px)] leading-[1.6] text-white/85 lg:mt-[1.4vw] lg:max-w-[42vw]">
              {children}
            </p>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
