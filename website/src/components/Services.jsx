import Tag from "./ui/Tag.jsx";
import SectionHeading from "./ui/SectionHeading.jsx";
import Marquee from "./ui/Marquee.jsx";
import Reveal from "./ui/Reveal.jsx";
import ServicesCarousel from "./services/ServicesCarousel.jsx";
import { SERVICES, MARQUEE_ITEMS } from "../data/services.js";

export default function Services() {
  return (
    <section id="services" className="bg-[#faf8f4] pb-12 lg:pb-[6.5vw]">
      <Reveal className="flex flex-col items-center px-6 text-center">
        <Tag>SERVICES</Tag>
        <SectionHeading className="mt-4 lg:mt-[1vw]">
          One Platform for Every Care Setting
        </SectionHeading>
      </Reveal>

      <Reveal y={60} delay={0.1} className="mt-10 lg:mt-[7vw]">
        <ServicesCarousel services={SERVICES} />
      </Reveal>

      <Reveal y={30} className="mt-4 lg:mt-[2.2vw]">
        <Marquee items={MARQUEE_ITEMS} />
      </Reveal>
    </section>
  );
}
