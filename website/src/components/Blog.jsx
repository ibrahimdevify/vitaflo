import { useCallback, useEffect, useRef, useState } from "react";
import Container from "./ui/Container.jsx";
import Tag from "./ui/Tag.jsx";
import SectionHeading from "./ui/SectionHeading.jsx";
import BodyText from "./ui/BodyText.jsx";
import Reveal from "./ui/Reveal.jsx";
import ArrowButton from "./ui/ArrowButton.jsx";
import BlogCard from "./blog/BlogCard.jsx";
import { BLOG_POSTS_FULL } from "../data/blogPosts.js"; // ← YEH CHANGE

export default function Blog() {
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0.2);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? 0.2 + 0.8 * Math.min(1, el.scrollLeft / max) : 1);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const scrollByCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const [a, b] = el.children;
    const step = b ? b.offsetLeft - a.offsetLeft : a.offsetWidth;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollBy({ left: dir * step, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section id="blog" className="bg-[#faf8f4] pb-16 lg:pb-[7.8vw]">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[23.5vw_1fr] lg:gap-[7.25vw]">
          <Reveal>
            <Tag>BLOG</Tag>
            <SectionHeading className="mt-4 lg:mt-[1vw] lg:max-w-[24vw]">
              Insights for a Healthier Life
            </SectionHeading>
            <BodyText size="lg" className="mt-4 lg:mt-[1.2vw]">
              Stay informed with expert advice, practical wellness tips, and the
              latest healthcare insights designed to help you make confident
              decisions about your health and wellbeing.
            </BodyText>
          </Reveal>

          <Reveal className="min-w-0">
            <ul
              ref={trackRef}
              onScroll={update}
              className="m-0 flex list-none snap-x snap-mandatory gap-4 overflow-x-auto p-0 lg:gap-[1.2vw] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {BLOG_POSTS_FULL.map((post) => (
                <li
                  key={post.slug}
                  className="w-[82%] shrink-0 snap-start lg:w-[calc((100%-1.2vw)/2)]"
                >
                  <BlogCard {...post} />
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-3 lg:mt-[2vw] lg:gap-[0.3vw]">
              <ArrowButton
                direction="prev"
                label="Previous articles"
                onClick={() => scrollByCard(-1)}
              />
              <ArrowButton
                direction="next"
                label="Next articles"
                onClick={() => scrollByCard(1)}
              />
              <div
                aria-hidden="true"
                className="ml-2 h-[6px] flex-1 overflow-hidden rounded-full bg-[#b4bfcc] lg:ml-[1vw]"
              >
                <div
                  className="h-full rounded-full bg-[#2c4d77] transition-[width] duration-300"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
