const TONES = {
  dark: "text-[#0f0f0f]",
  light: "text-white/90",
};

export default function SectionHeading({
  children,
  tone = "dark",
  className = "",
}) {
  return (
    <h2
      className={`text-[clamp(28px,3.58vw,92px)] font-normal leading-[1.2] tracking-[-0.025em] ${TONES[tone]} ${className}`}
    >
      {children}
    </h2>
  );
}
