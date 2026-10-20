import Container from "../ui/Container.jsx";
import Reveal from "../ui/Reveal.jsx";
import ServiceCard from "./ServiceCard.jsx";
import { SERVICES } from "../../data/services.js";

// Order of the cards on the Services page.
const ORDER = [
  "VitalFloPRACTICE",
  "VitalFloHOME",
  "VitalFloDPC",
  "VitalFloTRIALS",
  "Health Systems",
  "Value-Based Care",
  "Group Practices",
  "Decision Support",
];

const items = ORDER.map((t) => SERVICES.find((s) => s.title === t)).filter(
  Boolean,
);

export default function ServicesGrid() {
  return (
    // The first row of cards overlaps the bottom of the blue hero.
    <section
      id="services-list"
      className="relative z-10 -mt-12 bg-[linear-gradient(to_bottom,transparent_3rem,#faf8f4_3rem)] pb-16 lg:-mt-[8.65vw] lg:bg-[linear-gradient(to_bottom,transparent_8.65vw,#faf8f4_8.65vw)] lg:pb-[7.8vw]"
    >
      <Container>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-[1.65vw] lg:gap-y-[3.55vw]">
          {items.map((service, i) => (
            <Reveal key={service.title} y={60} delay={(i % 4) * 0.08}>
              <ServiceCard service={service} grid />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
