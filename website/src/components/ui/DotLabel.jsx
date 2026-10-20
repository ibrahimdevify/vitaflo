const TONES = {
  dark: { text: "text-[#0f0f0f]", dot: "bg-[#0f0f0f]" },
  light: { text: "text-white", dot: "bg-white" },
};

export default function DotLabel({ children, tone = "dark", className = "" }) {
  const t = TONES[tone];
  return (
    <div
      className={`flex items-center gap-[clamp(10px,0.75vw,18px)] text-[clamp(15px,0.93vw,24px)] ${t.text} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`h-[clamp(9px,0.58vw,14px)] w-[clamp(9px,0.58vw,14px)] rounded-full ${t.dot}`}
      />
      {children}
    </div>
  );
}
