export default function TestimonialCard({ quote, name, role }) {
  return (
    <figure className="m-0 flex h-full flex-col justify-between rounded-[clamp(16px,1.3vw,32px)] bg-[#f4f5f9] p-6 text-[#0f0f0f] lg:min-h-[22vw] lg:p-[1.2vw]">
      <div>
        <span
          aria-hidden="true"
          className="block h-[0.6em] font-serif text-[clamp(56px,4.6vw,120px)] font-bold leading-[1] text-lime-vc"
        >
          &ldquo;
        </span>
        <blockquote className="m-0 mt-4 text-[clamp(14px,0.95vw,24px)] leading-[2] lg:mt-[1vw]">
          {quote}
        </blockquote>
      </div>
      <figcaption className="mt-8 lg:mt-[2vw]">
        <span className="block text-[clamp(18px,1.3vw,34px)] leading-tight">
          {name}
        </span>
        <span className="mt-2 block text-[clamp(14px,0.95vw,24px)] lg:mt-[0.5vw]">
          {role}
        </span>
      </figcaption>
    </figure>
  );
}
