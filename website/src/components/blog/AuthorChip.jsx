const TONES = {
  dark: { label: "text-[#4a6fa0]", name: "text-[#0f0f0f]" },
  light: { label: "text-white/80", name: "text-white" },
};

const initials = (name) =>
  name
    .replace(/^the\s+/i, "")
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

// Round author photo + "Written by <name>". Without a photo it shows initials.
// Photos live in src/assets/authors/ (see data/blog.js).
export default function AuthorChip({
  name,
  photo,
  tone = "dark",
  className = "",
}) {
  const t = TONES[tone];
  return (
    <div className={`flex items-center gap-3 lg:gap-[0.8vw] ${className}`}>
      <span className="grid h-[clamp(44px,3.1vw,78px)] w-[clamp(44px,3.1vw,78px)] shrink-0 place-items-center overflow-hidden rounded-full bg-[#2c4d77] text-[clamp(13px,0.9vw,22px)] text-white">
        {photo ? (
          <img
            src={photo}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden="true">{initials(name)}</span>
        )}
      </span>
      <span className="min-w-0 leading-tight">
        <span className={`block text-[clamp(12px,0.8vw,20px)] ${t.label}`}>
          Written by
        </span>
        <span
          className={`mt-[0.15em] block text-[clamp(14px,1vw,25px)] font-medium ${t.name}`}
        >
          {name}
        </span>
      </span>
    </div>
  );
}
