import { forwardRef } from "react";
import { SITE } from "../../data/site.js";

const JobCard = forwardRef(function JobCard({ job, grid = false }, ref) {
  const { title, type, items } = job;

  return (
    <article
      ref={ref}
      className={`group flex flex-col text-white ${
        grid
          ? "relative w-full lg:h-[20.3vw]"
          : "absolute left-1/2 top-0 h-full w-[82vw] will-change-transform lg:w-[41.4vw]"
      }`}
    >
      {/* Card body: shrinks on hover. grid = plain card for the Career page grid */}
      <div
        className={`flex min-h-0 flex-1 flex-col justify-between rounded-[clamp(16px,1.2vw,30px)] bg-[#52729a] px-[clamp(20px,2.15vw,52px)] py-[clamp(20px,2.3vw,56px)] ${
          grid ? "gap-10 lg:gap-0" : ""
        }`}
      >
        <header>
          <h3 className="text-[clamp(18px,1.15vw,29px)] font-normal leading-tight">
            {title}
          </h3>
          <p className="mt-1 text-[clamp(13px,0.88vw,22px)] text-white/90 lg:mt-[0.75vw]">
            {type}
          </p>
        </header>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-[1vw]">
          <ul className="flex min-w-0 flex-col gap-2 lg:gap-[0.75vw]">
            {items.map((item) => (
              <li
                key={item}
                className="flex items-center gap-[clamp(10px,0.75vw,18px)] text-[clamp(13px,0.88vw,22px)] leading-[1.5]"
              >
                <span
                  aria-hidden="true"
                  className="h-[clamp(8px,0.58vw,14px)] w-[clamp(8px,0.58vw,14px)] shrink-0 rounded-full bg-lime-vc"
                />
                <span className="min-w-0 truncate">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Learn More: bade screen par sirf hover/focus par, chhote screen par hamesha */}
      <a
        href={SITE.portalUrl}
        draggable={false}
        className="mt-3 grid h-12 shrink-0 place-items-center overflow-hidden rounded-full bg-[#2f5075] text-[clamp(16px,1.28vw,32px)] text-white transition-[height,margin,opacity,background-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:bg-[#3a6291] motion-reduce:transition-none lg:mt-0 lg:h-0 lg:opacity-0 lg:group-focus-within:mt-[1.07vw] lg:group-focus-within:h-[3.93vw] lg:group-focus-within:opacity-100 lg:group-hover:mt-[1.07vw] lg:group-hover:h-[3.93vw] lg:group-hover:opacity-100"
      >
        Learn More
      </a>
    </article>
  );
});

export default JobCard;
