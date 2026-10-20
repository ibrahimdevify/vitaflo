const TONES = {
  dark: "text-[#111]",
  light: "text-white/90",
};

const SIZES = {
  md: "text-[clamp(14px,0.78vw,23px)] leading-[2]",
  lg: "text-[clamp(16px,1vw,26px)] leading-[1.8]",
};

export default function BodyText({
  children,
  tone = "dark",
  size = "md",
  className = "",
}) {
  return (
    <p className={`${SIZES[size]} ${TONES[tone]} ${className}`}>{children}</p>
  );
}
