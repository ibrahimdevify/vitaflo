import Navbar from "../Navbar.jsx";
import Container from "../ui/Container.jsx";
import Pulse from "../Pulse.jsx";

export default function BlogHero({ category, title, image, imageAlt }) {
  return (
    <section className="hero-bg relative overflow-hidden text-white">
      <div
        className="grid-lines pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <Navbar />

      <Container className="relative z-10">
        <div className="mt-12 lg:mt-[8vw]">
          <h1 className="m-0 mx-auto max-w-[70vw] text-center text-[clamp(28px,3.5vw,72px)] font-normal leading-[1.15] tracking-[-0.02em] lg:max-w-[52vw]">
            {title}
          </h1>
        </div>

        <div className="mt-6 flex items-center gap-4 text-[clamp(13px,0.85vw,22px)] text-white/90 lg:mt-[2vw] lg:gap-[1.2vw]">
          <span className="whitespace-nowrap">About VitalFlo Healthcare</span>
          <span className="h-px flex-1 bg-white/40" />
          <span className="flex items-center gap-[0.9vw] whitespace-nowrap">
            Since <Pulse /> 2017
          </span>
        </div>

        <div className="relative mt-10 lg:mt-[4vw]">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-[clamp(12px,1vw,24px)] bg-[#4a6f9a] lg:aspect-[1536/720]">
            {image && (
              <img
                src={image}
                alt={imageAlt || ""}
                loading="eager"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(53,87,124,0.15)_0%,rgba(53,87,124,0.55)_65%,rgba(44,77,119,0.92)_100%)]"
            />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white lg:p-[3vw]">
              <p className="m-0 text-[clamp(13px,0.85vw,22px)] text-white/85">
                {category}
              </p>
              <h2 className="m-0 mt-2 text-[clamp(22px,1.95vw,50px)] font-normal leading-[1.2] tracking-[-0.02em] lg:mt-[0.5vw]">
                {title}
              </h2>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
