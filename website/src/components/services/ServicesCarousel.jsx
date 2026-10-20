import { useEffect, useRef } from "react";
import gsap from "gsap";
import ServiceCard from "./ServiceCard.jsx";

const STEP = 14; // do cards ke beech ka angle (degrees)
const SENSITIVITY = 0.8; // trackpad swipe kitna tez ghoome

export default function ServicesCarousel({ services }) {
  const stageRef = useRef(null);
  const cardsRef = useRef([]);
  const N = services.length;

  useEffect(() => {
    const stage = stageRef.current;
    const cards = cardsRef.current;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const state = { pos: 0 };
    let target = 0;
    let wheelTimer;
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startPos = 0;

    const unit = () => cards[0].offsetWidth * 1.15; // drag ke px -> card

    const render = (p) => {
      const w = cards[0].offsetWidth;
      const R = w * 4.75; // arc ka radius
      cards.forEach((el, i) => {
        const d = ((((i - p + N / 2) % N) + N) % N) - N / 2; // wrap-around
        const abs = Math.abs(d);
        const a = (d * STEP * Math.PI) / 180;
        gsap.set(el, {
          x: R * Math.sin(a),
          y: R * (1 - Math.cos(a)),
          rotation: d * STEP,
          zIndex: 100 - Math.round(abs * 10),
          autoAlpha: abs > 3.4 ? 0 : abs > 3.1 ? 1 - (abs - 3.1) / 0.3 : 1,
        });
      });
    };

    const go = (t, duration = 0.7) => {
      target = t;
      gsap.to(state, {
        pos: t,
        duration: reduce ? 0 : duration,
        ease: "power3.out",
        overwrite: true,
        onUpdate: () => render(state.pos),
      });
    };
    const snap = () => go(Math.round(target), 0.8);

    gsap.set(cards, { xPercent: -50 });
    render(0);

    // Trackpad left-right / Shift + wheel
    const onWheel = (e) => {
      const horizontal = e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!horizontal) return; // upar-neeche scroll page ko jaane do
      e.preventDefault();
      const raw = e.deltaX || e.deltaY;
      const dx = Math.max(-120, Math.min(120, raw));
      go(target + (dx / unit()) * SENSITIVITY, 0.5);
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(snap, 140);
    };

    // Mouse / touch drag
    const onDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startPos = target;
    };
    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) < 6) return;
      moved = true;
      go(startPos - dx / unit(), 0.25);
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      if (moved) snap();
      setTimeout(() => (moved = false), 0);
    };

    // Drag ke baad galti se flip na ho
    const onClickCapture = (e) => {
      if (moved) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    const onKey = (e) => {
      if (e.key === "ArrowRight") go(Math.round(target) + 1, 0.8);
      if (e.key === "ArrowLeft") go(Math.round(target) - 1, 0.8);
    };

    const onResize = () => render(state.pos);

    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("click", onClickCapture, true);
    stage.addEventListener("keydown", onKey);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(wheelTimer);
      gsap.killTweensOf(state);
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("click", onClickCapture, true);
      stage.removeEventListener("keydown", onKey);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("resize", onResize);
    };
  }, [N]);

  return (
    <div
      ref={stageRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Health and wellness services"
      className="relative h-[125vw] cursor-grab touch-pan-y select-none overflow-hidden overscroll-x-contain active:cursor-grabbing lg:h-[44vw]"
    >
      <div className="absolute inset-x-0 top-0 h-0">
        {services.map((s, i) => (
          <ServiceCard
            key={s.title}
            service={s}
            ref={(el) => (cardsRef.current[i] = el)}
          />
        ))}
      </div>
    </div>
  );
}
