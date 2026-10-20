export default function MilestoneCard({ year, text }) {
  return (
    <div className="w-[44vw] shrink-0 pr-3 lg:w-[10.4vw] lg:pr-[0.8vw]">
      <div className="min-h-[120px] rounded-[clamp(14px,0.95vw,24px)] border border-white/25 bg-white/10 p-4 backdrop-blur-sm lg:h-[6.4vw] lg:min-h-0 lg:px-[0.7vw] lg:pb-0 lg:pt-[0.87vw]">
        <p className="text-[clamp(18px,1.2vw,30px)] leading-none text-white">
          {year}
        </p>
        <p className="mt-3 text-[clamp(12px,0.85vw,21px)] leading-[1.7] text-white/90 lg:mt-[0.85vw]">
          {text}
        </p>
      </div>
    </div>
  );
}
