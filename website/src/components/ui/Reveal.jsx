import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Fades + slides its children in when they scroll into view.
export default function Reveal({
  children,
  y = 40,
  x = 0,
  scale = 1,
  delay = 0,
  duration = 0.9,
  className = "",
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        y,
        x,
        scale,
        opacity: 0,
        duration,
        delay,
        ease: "power3.out",
        // Remove the leftover inline transform so sticky/fixed children work.
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
      });
    }, ref);
    return () => ctx.revert();
  }, [y, x, scale, delay, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
