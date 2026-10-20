const TONES = {
  glass: "bg-white/20 text-white backdrop-blur-sm",
  solid: "bg-[#2c4d77] text-white",
};

export default function IconCircle({ Icon, tone = "glass", className = "" }) {
  return (
    <span
      className={`grid h-[clamp(44px,3.2vw,80px)] w-[clamp(44px,3.2vw,80px)] place-items-center rounded-full ${TONES[tone]} ${className}`}
    >
      <Icon className="h-[42%] w-[42%]" strokeWidth={1.8} aria-hidden="true" />
    </span>
  );
}
