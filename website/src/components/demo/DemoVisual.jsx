import { useId } from "react";

// Optional photo: put it at src/assets/demo.jpg (or .png / .webp).
// Without it the circle is a plain blue gradient, nothing breaks.
const photos = import.meta.glob("../../assets/demo.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});
const photo = Object.values(photos)[0] ?? null;

function Dots({ className = "" }) {
  const id = `dots-${useId().replace(/:/g, "")}`;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 160"
      className={`pointer-events-none absolute h-auto text-[#3b5bdb] ${className}`}
    >
      <defs>
        <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="160" height="160" fill={`url(#${id})`} />
    </svg>
  );
}

// Round photo with two faded dot grids behind it (right side of the Demo page).
export default function DemoVisual() {
  return (
    <div className="relative mx-auto aspect-square w-[min(80vw,420px)] lg:w-[24vw]">
      <Dots className="-right-[22%] -top-[20%] w-[60%] [mask-image:linear-gradient(225deg,#000_10%,transparent_85%)]" />
      <Dots className="-bottom-[16%] -left-[26%] w-[42%] [mask-image:linear-gradient(45deg,#000_10%,transparent_85%)]" />

      <div className="absolute inset-0 overflow-hidden rounded-full bg-[linear-gradient(135deg,#2c4d77,#4a6f9a)] shadow-[0_0_90px_rgba(74,111,154,0.35)]">
        {photo && (
          <img src={photo} alt="" className="h-full w-full object-cover" />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#2c4d77]/35 mix-blend-multiply"
        />
      </div>
    </div>
  );
}
