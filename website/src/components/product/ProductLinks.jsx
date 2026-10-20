import { ArrowRight } from "lucide-react";
import Container from "../ui/Container.jsx";
import Reveal from "../ui/Reveal.jsx";

// Grid of link cards (title + "Read More"). Each card opens in a new tab.
export default function ProductLinks({ title, items }) {
  return (
    <section className="bg-[#faf9f7] py-16 lg:py-[7vw]">
      <Container>
        <Reveal>
          <h2 className="m-0 text-center text-[clamp(24px,2.4vw,60px)] font-medium text-[#2c4d77]">
            {title}
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-[3.5vw] lg:grid-cols-3 lg:gap-[1.6vw]">
          {items.map((item, i) => (
            <Reveal key={item.href} delay={(i % 3) * 0.08} className="h-full">
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full min-h-[220px] flex-col justify-between rounded-[clamp(16px,1.3vw,32px)] border-2 border-transparent bg-white p-7 text-[#2c4d77] transition-colors hover:border-[#2c4d77] lg:min-h-[14vw] lg:p-[2.2vw]"
              >
                <span className="text-[clamp(16px,1.2vw,30px)] leading-[1.4] text-[#1f2d3d]">
                  {item.title}
                </span>
                <span className="mt-8 inline-flex items-center justify-center gap-2 text-[clamp(14px,1vw,24px)] lg:mt-[2vw]">
                  Read More
                  <ArrowRight
                    aria-hidden="true"
                    className="h-[1.1em] w-[1.1em] transition-transform group-hover:translate-x-1"
                  />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
