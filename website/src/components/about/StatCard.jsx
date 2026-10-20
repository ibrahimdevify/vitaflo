const TONES = {
  mid: "bg-[#557396] text-white",
  deep: "bg-[#2f5378] text-white",
  light: "bg-white text-[#0f0f0f]",
};

export default function StatCard({ value, label, text, tone = "mid" }) {
  const light = tone === "light";
  return (
    <div
      className={`flex h-full min-h-[300px] flex-col justify-between rounded-[clamp(16px,1.2vw,30px)] p-6 lg:min-h-0 lg:p-[1.2vw] ${TONES[tone]}`}
    >
      <div>
        <p className="m-0 text-[clamp(48px,4vw,104px)] font-normal leading-[1.1] tracking-[-0.03em]">
          {value}
        </p>
        <p className="m-0 mt-2 text-[clamp(15px,1vw,26px)] leading-[1.4] lg:mt-[0.4vw]">
          {label}
        </p>
      </div>
      <p
        className={`m-0 mt-8 leading-[1.75] lg:mt-0 ${
          light
            ? "text-[clamp(14px,0.95vw,24px)] lg:max-w-[46vw]"
            : "text-[clamp(14px,0.83vw,22px)] text-white/90"
        }`}
      >
        {text}
      </p>
    </div>
  );
}
