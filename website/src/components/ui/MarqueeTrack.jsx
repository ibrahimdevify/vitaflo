import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function MarqueeTrack({
  children,
  duration = 40,
  reverse = false,
  pauseOnHover = true,
  className = "",
}) {
  const trackRef = useRef(null);
  const tweenRef = useRef(null);

  useEffect(() => {
    const el = trackRef.current;
    gsap.set(el, { xPercent: reverse ? -50 : 0 });
    const tween = gsap.to(el, {
      xPercent: reverse ? 0 : -50,
      ease: "none",
      duration,
      repeat: -1,
    });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      tween.pause();
    }
    tweenRef.current = tween;
    return () => tween.kill();
  }, [duration, reverse]);

  const setSpeed = (v) => {
    if (!pauseOnHover || !tweenRef.current) return;
    gsap.to(tweenRef.current, { timeScale: v, duration: 0.6, overwrite: true });
  };

  return (
    <div
      className={`overflow-hidden ${className}`}
      onMouseEnter={() => setSpeed(0)}
      onMouseLeave={() => setSpeed(1)}
    >
      <div ref={trackRef} className="flex w-max">
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
