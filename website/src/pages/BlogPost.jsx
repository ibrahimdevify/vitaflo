import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageHero from "../components/PageHero.jsx";
import Container from "../components/ui/Container.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import AuthorBlock from "../components/blog/AuthorBlock.jsx";
import ArticleBody from "../components/blog/ArticleBody.jsx";
import ClosingBanner from "../components/ClosingBanner.jsx";
import Contact from "../components/Contact.jsx";
import Footer from "../components/Footer.jsx";
import { findPost } from "../data/blogLookup.js";

const BACK =
  "inline-flex items-center gap-2 text-[clamp(15px,1vw,26px)] transition-colors";
const META =
  "m-0 flex flex-wrap items-center gap-x-6 gap-y-1 text-[clamp(13px,0.93vw,24px)] text-white/90 lg:gap-x-[2.4vw]";

// One article: /blog/<slug>
export default function BlogPost() {
  const { slug } = useParams();
  const post = findPost(slug);

  if (!post) {
    return (
      <>
        <PageHero title="Blog" tagline="Article not found">
          <Container className="relative z-10 pb-16 pt-10 lg:pb-[6vw] lg:pt-[5vw]">
            <h2 className="m-0 text-[clamp(28px,2.9vw,72px)] font-normal leading-[1.15] tracking-[-0.03em] text-white">
              We couldn&apos;t find that article.
            </h2>
            <Link
              to="/blog"
              className={`${BACK} mt-6 text-white hover:text-lime-vc lg:mt-[2vw]`}
            >
              <ArrowLeft className="h-[1.1em] w-[1.1em]" aria-hidden="true" />
              Back to all articles
            </Link>
          </Container>
        </PageHero>
        <Footer />
      </>
    );
  }

  // Short / old URL -> send to the real one
  if (post.slug !== slug) return <Navigate to={`/blog/${post.slug}`} replace />;

  return (
    <>
      <PageHero title="Blog" tagline={post.category}>
        {/* Cover card: photo with the title and byline over its bottom edge */}
        <Container className="relative z-10 pb-16 pt-10 lg:pb-[7.5vw] lg:pt-[3.6vw]">
          <Reveal y={50}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[clamp(16px,1.3vw,32px)] bg-[#4a6f9a] sm:aspect-[16/10] lg:aspect-[1843/960]">
              {post.image && (
                <img
                  src={post.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(44,77,119,0)_38%,rgba(44,77,119,0.92)_100%)]"
              />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white lg:p-[3vw]">
                <p className="m-0 text-[clamp(13px,0.93vw,24px)] text-white/85">
                  {post.category}
                </p>
                <h2 className="m-0 mt-2 text-[clamp(21px,2.5vw,64px)] font-normal leading-[1.15] tracking-[-0.025em] lg:mt-[0.6vw] lg:max-w-[62vw]">
                  {post.title}
                </h2>
                <p className={`${META} mt-3 lg:mt-[1.2vw]`}>
                  <span>By {post.author}</span>
                  <span>{post.date}</span>
                  {post.readTime && <span>{post.readTime}</span>}
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </PageHero>

      <section className="bg-[#faf8f4] pb-16 pt-12 lg:pb-[7.8vw] lg:pt-[6vw]">
        <Container>
          <article className="mx-auto min-w-0 lg:max-w-[51vw]">
            <ArticleBody body={post.body} />

            <div className="mt-14 border-t border-black/15 pt-8 lg:mt-[5vw] lg:pt-[2.4vw]">
              <AuthorBlock name={post.author} photo={post.authorPhoto} />
              <Link
                to="/blog"
                className={`${BACK} mt-8 text-[#0f0f0f] hover:text-[#2c4d77] lg:mt-[2.4vw]`}
              >
                <ArrowLeft className="h-[1.1em] w-[1.1em]" aria-hidden="true" />
                All articles
              </Link>
            </div>
          </article>
        </Container>
      </section>

      <ClosingBanner />
      <Contact />
      <Footer />
    </>
  );
}
