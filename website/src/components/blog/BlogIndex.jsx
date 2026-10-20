import { useState } from "react";
import Container from "../ui/Container.jsx";
import Reveal from "../ui/Reveal.jsx";
import BodyText from "../ui/BodyText.jsx";
import BlogArticleRow from "./BlogArticleRow.jsx";
import BlogSidebar from "./BlogSidebar.jsx";
import { BLOG_ARTICLES, BLOG_TAGS, BLOG_POPULAR } from "../../data/blog.js";

// Blog page body: Latest Articles (left) + sidebar (right).
// The search box and the tag pills filter the list on the left.
export default function BlogIndex() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState(null);

  const q = query.trim().toLowerCase();
  const shown = BLOG_ARTICLES.filter(
    (a) =>
      (!tag || a.tags.includes(tag)) &&
      (!q || `${a.title} ${a.excerpt} ${a.category}`.toLowerCase().includes(q)),
  );

  const reset = () => {
    setQuery("");
    setTag(null);
  };

  return (
    <section
      id="latest-articles"
      className="bg-[#faf8f4] py-16 lg:pb-[7.8vw] lg:pt-[7.8vw]"
    >
      <Container>
        <div className="grid gap-14 lg:grid-cols-[47.6vw_1fr] lg:gap-[3.14vw]">
          <div className="min-w-0">
            <h2 className="m-0 text-[clamp(26px,2.05vw,52px)] font-normal leading-[1.2] tracking-[-0.02em] text-[#0f0f0f]">
              Latest Articles
            </h2>

            {shown.length > 0 ? (
              <ul className="m-0 mt-2 flex list-none flex-col divide-y divide-black/15 p-0 lg:mt-[1.4vw]">
                {shown.map((post) => (
                  <li key={post.slug} className="py-8 lg:py-[2.2vw]">
                    <Reveal y={50}>
                      <BlogArticleRow {...post} />
                    </Reveal>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-8 lg:mt-[3.8vw]" role="status">
                <BodyText size="lg">No articles match your search.</BodyText>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-4 text-[clamp(15px,1vw,26px)] text-[#2c4d77] underline underline-offset-4"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

          <Reveal delay={0.1}>
            <BlogSidebar
              tags={BLOG_TAGS}
              activeTag={tag}
              onTag={setTag}
              query={query}
              onQuery={setQuery}
              popular={BLOG_POPULAR}
            />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
