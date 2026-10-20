const TONES = {
  dark: "bg-[#2c4d77] text-lime-vc",
  glass: "bg-white/25 text-white",
};

export default function Tag({ children, tone = "dark", className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-[clamp(16px,1.45vw,36px)] py-[clamp(8px,0.875vw,22px)] text-[clamp(13px,0.89vw,21px)] ${TONES[tone]} ${className}`}
    >
      [ {children} ]
    </span>
  );
}
