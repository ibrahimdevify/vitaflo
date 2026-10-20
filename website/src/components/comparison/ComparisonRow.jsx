import { ArrowRight, Check, X } from "lucide-react";

const BUBBLE =
  "grid h-[clamp(24px,1.35vw,34px)] w-[clamp(24px,1.35vw,34px)] shrink-0 place-items-center rounded-full";

export default function ComparisonRow({ before, after }) {
  return (
    <li className="m-0 grid grid-cols-[1fr_auto_auto_auto_1fr] items-center border-b border-black/20 py-4 lg:min-h-[5.4vw] lg:py-0">
      <span className="pr-[clamp(8px,1.25vw,32px)] text-right text-[clamp(13px,0.95vw,24px)] leading-[1.4] text-[#8a8a8a]">
        {before}
      </span>
      <span className={`${BUBBLE} bg-[#fde4e4] text-[#e5484d]`}>
        <X className="h-[55%] w-[55%]" strokeWidth={2.2} aria-hidden="true" />
      </span>
      <ArrowRight
        className="mx-[clamp(6px,2vw,52px)] h-[clamp(14px,0.85vw,22px)] w-[clamp(14px,0.85vw,22px)] text-[#b9b9b9]"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <span className={`${BUBBLE} bg-[#e8e8e6] text-[#2b2b2b]`}>
        <Check
          className="h-[55%] w-[55%]"
          strokeWidth={2.2}
          aria-hidden="true"
        />
      </span>
      <span className="pl-[clamp(8px,1.25vw,32px)] text-[clamp(13px,0.95vw,24px)] leading-[1.4] text-[#0f0f0f]">
        {after}
      </span>
    </li>
  );
}
