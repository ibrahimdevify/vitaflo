import PageHero from "../components/PageHero.jsx";
import Container from "../components/ui/Container.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import BlogFeatured from "../components/blog/BlogFeatured.jsx";
import BlogListItem from "../components/blog/BlogListItem.jsx";
import BlogIndex from "../components/blog/BlogIndex.jsx";
import Contact from "../components/Contact.jsx";
import Footer from "../components/Footer.jsx";
import { BLOG_FEATURED, BLOG_HERO_LIST } from "../data/blog.js";
import ClosingBanner from "../components/ClosingBanner.jsx";

export default function Blog() {
  return (
    <>
      <PageHero title="Blog" tagline="About VitalFlo Healthcare">
        {/* Featured post (left) + latest posts list (right), inside the hero */}
        <Container className="relative z-10 pb-16 pt-12 lg:pb-[7.7vw] lg:pt-[8.6vw]">
          <div className="grid gap-10 lg:grid-cols-[47.6vw_1fr] lg:gap-[3.55vw]">
            <Reveal y={60}>
              <BlogFeatured {...BLOG_FEATURED} />
            </Reveal>

            <Reveal delay={0.1}>
              <ul className="m-0 flex list-none flex-col gap-8 p-0 lg:gap-[2.6vw] lg:pt-[0.2vw]">
                {BLOG_HERO_LIST.map((post) => (
                  <li key={post.slug}>
                    <BlogListItem {...post} />
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </PageHero>

      <BlogIndex />
      <ClosingBanner />
      <Contact />

      <Footer />
    </>
  );
}
