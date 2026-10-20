import { Link } from "react-router-dom";
import Container from "../ui/Container.jsx";
import Reveal from "../ui/Reveal.jsx";

export default function ProductCta({ title, subtitle, button = "Contact Us" }) {
  return (
    <section className="bg-[#faf9f7] pb-20 pt-4 text-center lg:pb-[9vw] lg:pt-[1vw]">
      <Container>
        <Reveal>
          <h2 className="m-0 text-[clamp(22px,2vw,52px)] font-medium text-[#2c4d77]">
            {title}
          </h2>
          {subtitle && (
            <p className="m-0 mt-3 text-[clamp(15px,1.2vw,30px)] text-[#2c4d77]/80 lg:mt-[1vw]">
              {subtitle}
            </p>
          )}
          <Link
            to="/contact"
            className="mt-6 inline-flex items-center rounded-full bg-[#2c4d77] px-[clamp(24px,2.2vw,56px)] py-[clamp(12px,1vw,26px)] text-[clamp(14px,1vw,24px)] text-lime-vc transition-opacity hover:opacity-90 lg:mt-[2vw]"
          >
            {button}
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
