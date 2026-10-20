import { ADVISORS, aboutImage } from "../data/advisors.js";

// Featured clinician shown in the hero (real data from the advisory board).
const DOCTOR = ADVISORS.find((a) => a.photo === "todd-rowland");

export default function DoctorCard({ className = "" }) {
  const photo = aboutImage(DOCTOR.photo);

  return (
    <div
      className={`flex w-full gap-3 rounded-[16px] border border-white/20 bg-white/15 p-[10px] backdrop-blur-md lg:w-[28.9vw] lg:max-w-none lg:gap-[0.7vw] lg:rounded-[1.05vw] lg:p-[0.75vw] ${className}`}
    >
      <div className="aspect-[4/5] w-[36%] max-w-[150px] shrink-0 overflow-hidden rounded-[12px] bg-[#4a6f9a] lg:aspect-auto lg:h-[11.45vw] lg:w-[10vw] lg:max-w-none lg:rounded-[0.8vw]">
        {photo && (
          <img
            src={photo}
            alt={DOCTOR.name}
            width="400"
            height="400"
            className="h-full w-full object-cover object-[50%_top]"
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 pb-1 pt-1 lg:gap-0 lg:pb-[1.2vw] lg:pt-[0.4vw]">
        <div>
          <div className="text-[clamp(22px,1.9vw,48px)] font-light leading-[1.1]">
            Dr. Todd
            <br />
            Rowland
          </div>
          <div className="mt-2 text-[clamp(12px,0.76vw,20px)] leading-snug text-white/90 lg:mt-[0.7vw]">
            Chief Medical Officer &amp; Clinical Advisory Chair
          </div>
        </div>
        <div className="flex items-center gap-3 lg:gap-[0.8vw]">
          <div className="whitespace-nowrap text-[clamp(14px,0.98vw,26px)]">
            FAAPMR
          </div>
          <div className="border-l border-white/40 pl-3 text-[clamp(11px,0.85vw,22px)] leading-[1.5] lg:pl-[0.8vw] lg:leading-[1.65]">
            CMIO,
            <br />
            HEALTHLINC
          </div>
        </div>
      </div>
    </div>
  );
}
