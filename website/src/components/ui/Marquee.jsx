import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Marquee({ items, duration = 40, className = "" }) {
  const trackRef = useRef(null);

  useEffect(() => {
    const tween = gsap.to(trackRef.current, {
      xPercent: -50,
      ease: "none",
      duration,
      repeat: -1,
    });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      tween.pause();
    }
    return () => tween.kill();
  }, [duration]);

  const row = (hidden) => (
    <div className="flex shrink-0 items-center pr-[1.2vw]" aria-hidden={hidden}>
      {items.map((text, i) => (
        <span key={text} className="flex items-center">
          <span>{text}</span>
          {i < items.length - 1 && (
            <span className="mx-[1.6vw] h-[0.3em] w-[0.3em] rounded-full bg-current" />
          )}
        </span>
      ))}
    </div>
  );

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        ref={trackRef}
        className="flex w-max whitespace-nowrap text-[clamp(34px,4vw,104px)] leading-[1.15] tracking-[-0.03em] text-[#0f0f0f]"
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
