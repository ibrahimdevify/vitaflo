import { useEffect } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

// Smooth, eased page scrolling driven by GSAP.
// The page still uses native scrolling underneath (so position: sticky,
// ScrollTrigger, scrollbar drag and keyboard keep working); we only ease the
// mouse wheel and the #anchor links. Touch devices and users who prefer
// reduced motion keep plain native scrolling.
export default function useSmoothScroll({
  duration = 1.1, // wheel easing time (seconds) - higher = floatier
  ease = "power3.out",
  wheelSpeed = 1, // 1 = normal, 1.5 = faster
} = {}) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mouse = window.matchMedia("(hover: hover) and (pointer: fine)");

    // Lazy images change page height - keep ScrollTrigger positions correct.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    if (reduced.matches || !mouse.matches) {
      return () => window.removeEventListener("load", refresh);
    }

    const maxScroll = () =>
      document.documentElement.scrollHeight - window.innerHeight;
    let target = window.scrollY;
    let animating = false;

    const scrollTo = (y, time = duration) => {
      target = gsap.utils.clamp(0, maxScroll(), y);
      animating = true;
      gsap.to(window, {
        scrollTo: { y: target },
        duration: time,
        ease,
        overwrite: true,
        onComplete: () => {
          animating = false;
        },
      });
    };

    const stop = () => {
      gsap.killTweensOf(window);
      animating = false;
      target = window.scrollY;
    };

    // Let nested scrollable elements (textarea, etc.) scroll on their own.
    const scrollsInside = (el, dy) => {
      while (el && el !== document.body && el !== document.documentElement) {
        const s = getComputedStyle(el);
        if (
          /(auto|scroll)/.test(s.overflowY) &&
          el.scrollHeight > el.clientHeight
        ) {
          const atTop = el.scrollTop <= 0;
          const atBottom =
            el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
          if ((dy < 0 && !atTop) || (dy > 0 && !atBottom)) return true;
        }
        el = el.parentElement;
      }
      return false;
    };

    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey || e.defaultPrevented) return; // pinch-zoom etc.
      const horizontal = e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (horizontal) return; // carousels handle sideways scrolling themselves
      if (scrollsInside(e.target, e.deltaY)) return;
      e.preventDefault();
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 40;
      else if (e.deltaMode === 2) dy *= window.innerHeight;
      scrollTo((animating ? target : window.scrollY) + dy * wheelSpeed);
    };

    // Scrollbar drag / keyboard / find-in-page: hand control back to the browser.
    const onScroll = () => {
      if (!animating) target = window.scrollY;
    };

    const onClick = (e) => {
      const link = e.target.closest?.('a[href^="#"]');
      if (!link || e.defaultPrevented) return;
      const id = decodeURIComponent(link.getAttribute("href").slice(1));
      const el = id && document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      scrollTo(el.getBoundingClientRect().top + window.scrollY, 1.4);
      window.history.pushState(null, "", `#${id}`);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", stop);
    window.addEventListener("pointerdown", stop);
    document.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("load", refresh);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", stop);
      window.removeEventListener("pointerdown", stop);
      document.removeEventListener("click", onClick);
      gsap.killTweensOf(window);
    };
  }, [duration, ease, wheelSpeed]);
}
