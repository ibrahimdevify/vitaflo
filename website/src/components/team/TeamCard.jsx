import SocialButton from "../ui/SocialButton.jsx";

export default function TeamCard({ member }) {
  const { name, role, image, linkedin } = member;

  return (
    <article className="flex w-[46vw] shrink-0 flex-col items-center px-2 text-center lg:w-[16.2vw]">
      {image ? (
        <img
          src={image}
          alt={name}
          width="217"
          height="217"
          draggable="false"
          loading="lazy"
          className="h-[34vw] w-[34vw] rounded-full object-cover lg:h-[9vw] lg:w-[9vw]"
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid h-[34vw] w-[34vw] place-items-center rounded-full bg-[#2c4d77] text-[clamp(28px,2.4vw,60px)] text-white lg:h-[9vw] lg:w-[9vw]"
        >
          {name
            .replace(/^dr\.?\s+/i, "")
            .split(/[\s,]+/)
            .slice(0, 2)
            .map((w) => w[0])
            .join("")
            .toUpperCase()}
        </span>
      )}
      <h3 className="mt-4 text-[clamp(15px,1.1vw,28px)] font-normal leading-tight text-[#0f0f0f] lg:mt-[1.3vw]">
        {name}
      </h3>
      <p className="mt-1 text-[clamp(13px,0.9vw,24px)] leading-snug text-[#111] lg:mt-[0.5vw]">
        {role}
      </p>
      {linkedin && (
        <SocialButton
          href={linkedin}
          label={`${name} on LinkedIn`}
          className="mt-3 lg:mt-[0.8vw]"
        />
      )}
    </article>
  );
}
