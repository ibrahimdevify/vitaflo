import { ADVISORS, aboutImage } from "../data/advisors.js";

// Four members of the Clinical Advisory Board (Dr. Rowland is the featured
// clinician in the DoctorCard, so he is left out here).
const SHOWN = [
  "carl-mottram",
  "wes-sublett",
  "michelle-hernandez",
  "david-peden",
];
const PEOPLE = SHOWN.map((p) => ADVISORS.find((a) => a.photo === p));

const SIZE =
  "h-[clamp(36px,2.15vw,60px)] w-[clamp(36px,2.15vw,60px)] rounded-full ring-2 ring-[#4a6a8c]";

export default function Avatars({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 lg:gap-[0.7vw] ${className}`}>
      <div className="flex -space-x-3 lg:-space-x-[0.7vw]">
        {PEOPLE.map((a) => {
          const src = aboutImage(a.photo);
          return src ? (
            <img
              key={a.photo}
              src={src}
              alt={a.name}
              width="52"
              height="52"
              className={`${SIZE} object-cover`}
            />
          ) : (
            <span
              key={a.photo}
              className={`${SIZE} flex items-center justify-center bg-[#4a6f9a] text-xs`}
            >
              {a.name.replace(/^Dr\.\s*/, "").slice(0, 1)}
            </span>
          );
        })}
      </div>
      <span className="text-[clamp(14px,0.75vw,20px)] text-white/90">
        Clinical advisors
      </span>
    </div>
  );
}
