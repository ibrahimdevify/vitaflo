import { forwardRef, useState } from "react";
import IconCircle from "../ui/IconCircle.jsx";
import ServiceArt from "./ServiceArt.jsx";

const hidden = {
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
};

// `grid` = plain card for a normal grid layout (Services page).
// Without it the card is absolutely positioned for the Home page carousel.
const ServiceCard = forwardRef(function ServiceCard(
  { service, grid = false },
  ref,
) {
  const { title, tagline, description, image, art, Icon, bakedOverlay } =
    service;
  const [flipped, setFlipped] = useState(false);

  const radius = "rounded-[clamp(16px,1.3vw,32px)]";
  const layout = grid
    ? "relative w-full"
    : "absolute left-1/2 top-0 w-[68vw] will-change-transform lg:w-[17.9vw]";

  return (
    <article
      ref={ref}
      tabIndex={0}
      onPointerEnter={(e) => e.pointerType === "mouse" && setFlipped(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setFlipped(false)}
      onClick={(e) =>
        e.nativeEvent.pointerType === "touch" && setFlipped((f) => !f)
      }
      onFocus={() => setFlipped(true)}
      onBlur={() => setFlipped(false)}
      className={`${layout} aspect-[432/575] outline-none focus-visible:ring-2 focus-visible:ring-[#2c4d77] ${radius}`}
      style={{ perspective: "1400px" }}
    >
      <div
        className="relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:duration-0 cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front: photo */}
        <div
          className={`absolute inset-0 overflow-hidden bg-gradient-to-b from-[#9fb3c7] to-[#4a6fa0] ${radius}`}
          style={hidden}
        >
          {image && (
            <img
              src={image}
              alt=""
              draggable="false"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
          {!image && art && <ServiceArt name={art} />}
          {!bakedOverlay && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% via-[#4a6fa0]/45 via-70% to-[#3f6288]/95" />
          )}
          <div className="relative flex h-full flex-col items-center justify-end px-4 pb-[7%] text-center text-white">
            <h3 className="text-[clamp(22px,2.1vw,52px)] font-normal leading-tight">
              {title}
            </h3>
            <p className="mt-1 text-[clamp(13px,0.9vw,22px)] text-white/90">
              {tagline}
            </p>
            <IconCircle Icon={Icon} tone="glass" className="mt-[6%]" />
          </div>
        </div>

        {/* Back: details */}
        <div
          className={`absolute inset-0 flex flex-col overflow-hidden bg-white p-[7%] ${radius}`}
          style={{ ...hidden, transform: "rotateY(180deg)" }}
        >
          <IconCircle Icon={Icon} tone="solid" />
          <h3 className="mt-[14%] text-[clamp(22px,2.1vw,52px)] font-normal leading-tight text-[#0f0f0f]">
            {title}
          </h3>
          <p className="mt-2 text-[clamp(13px,0.9vw,22px)] text-[#4a6fa0]">
            {tagline}
          </p>
          <p className="mt-3 text-[clamp(12px,0.83vw,21px)] leading-[1.6] text-[#111] lg:mt-[7%] lg:leading-[2]">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
});

export default ServiceCard;
