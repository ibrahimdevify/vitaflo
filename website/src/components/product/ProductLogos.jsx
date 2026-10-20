import Container from "../ui/Container.jsx";
import MarqueeTrack from "../ui/MarqueeTrack.jsx";

// Scrolling strip of (white) partner logos on a dark blue band.
export default function ProductLogos({ title, logos }) {
  if (!logos.length) return null;
  return (
    <section className="bg-[#2c4d77] py-12 text-white lg:py-[4.5vw]">
      <Container>
        <h2 className="m-0 text-center text-[clamp(20px,1.8vw,46px)] font-medium">
          {title}
        </h2>
      </Container>
      <MarqueeTrack duration={45} className="mt-8 lg:mt-[3vw]">
        {logos.map((l) => (
          <img
            key={l.name}
            src={l.src}
            alt={l.name}
            draggable="false"
            className="mx-[clamp(24px,3.5vw,90px)] h-[clamp(32px,3.4vw,80px)] w-auto max-w-none shrink-0 object-contain"
          />
        ))}
      </MarqueeTrack>
    </section>
  );
}
