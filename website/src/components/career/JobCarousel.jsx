import { useEffect, useRef } from "react";
import gsap from "gsap";
import JobCard from "./JobCard.jsx";
import ArrowButton from "../ui/ArrowButton.jsx";

export default function JobCarousel({ jobs }) {
  const stageRef = useRef(null);
  const cardsRef = useRef([]);
  const stepRef = useRef(() => {});
  const N = jobs.length;

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

    const stepPx = () => cards[0].offsetWidth * 1.0145; // card + gap

    const render = (p) => {
      const s = stepPx();
      cards.forEach((el, i) => {
        const d = ((((i - p + N / 2) % N) + N) % N) - N / 2; // wrap-around
        gsap.set(el, { x: d * s, autoAlpha: Math.abs(d) > 2.5 ? 0 : 1 });
      });
    };

    const go = (t, duration = 0.8) => {
      target = t;
      gsap.to(state, {
        pos: t,
        duration: reduce ? 0 : duration,
        ease: "power3.out",
        overwrite: true,
        onUpdate: () => render(state.pos),
      });
    };
    const snap = () => go(Math.round(target));

    gsap.set(cards, { xPercent: -50 });
    render(0);
    stepRef.current = (dir) => go(Math.round(target) + dir);

    // Trackpad left-right / Shift + wheel
    const onWheel = (e) => {
      const horizontal = e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!horizontal) return; // upar-neeche scroll page ko jaane do
      e.preventDefault();
      const dx = Math.max(-120, Math.min(120, e.deltaX || e.deltaY));
      go(target + (dx / stepPx()) * 0.9, 0.5);
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
      go(startPos - dx / stepPx(), 0.25);
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      if (moved) snap();
    };
    const onClickCapture = (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const onKey = (e) => {
      if (e.key === "ArrowRight") stepRef.current(1);
      if (e.key === "ArrowLeft") stepRef.current(-1);
    };
    const onResize = () => render(state.pos);

    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("keydown", onKey);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("resize", onResize);
    stage.addEventListener("click", onClickCapture, true);
    return () => {
      clearTimeout(wheelTimer);
      gsap.killTweensOf(state);
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("keydown", onKey);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("resize", onResize);
      stage.removeEventListener("click", onClickCapture, true);
    };
  }, [N]);

  return (
    <>
      <div
        ref={stageRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Open positions"
        className="relative h-[78vw] cursor-grab touch-pan-y select-none overflow-hidden overscroll-x-contain outline-none active:cursor-grabbing lg:h-[20.3vw]"
      >
        {jobs.map((job, i) => (
          <JobCard
            key={job.title}
            job={job}
            ref={(el) => (cardsRef.current[i] = el)}
          />
        ))}
      </div>

      <div className="flex justify-end gap-3 px-6 pt-8 lg:gap-[0.66vw] lg:pr-[15%] lg:pt-[4vw]">
        <ArrowButton direction="prev" onClick={() => stepRef.current(-1)} />
        <ArrowButton direction="next" onClick={() => stepRef.current(1)} />
      </div>
    </>
  );
}
