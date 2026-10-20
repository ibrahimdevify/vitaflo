import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import { getPostBySlug } from "../data/blogPosts.js";
import { useEffect } from "react";

export default function BlogDetails() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f4]">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post not found</h1>
          <Link to="/blog" className="text-blue-600 hover:underline">
            &larr; Back to all articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#faf8f4] pb-24 pt-16 lg:pt-24">
      <Container className="max-w-4xl">
        <Link
          to="/blog"
          className="mb-10 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          All articles
        </Link>

        <header className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-3 text-sm font-medium text-blue-600">
            <span>{post.category}</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500">{post.date}</span>
            {post.readTime && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500">{post.readTime}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl mb-6">
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {post.subtitle}
            </p>
          )}
        </header>

        {post.image && (
          <div className="mb-14 overflow-hidden rounded-2xl">
            <img
              src={post.image}
              alt={post.title}
              className="w-full object-cover max-h-[500px]"
            />
          </div>
        )}

        <article className="mx-auto max-w-3xl">
          {post.content.map((block, index) => {
            switch (block.type) {
              case "paragraph":
                return (
                  <p
                    key={index}
                    className="mb-6 text-lg leading-relaxed text-gray-800"
                  >
                    {block.text}
                  </p>
                );
              case "heading":
                return block.level === 2 ? (
                  <h2
                    key={index}
                    className="mb-4 mt-12 text-2xl font-bold text-gray-900"
                  >
                    {block.text}
                  </h2>
                ) : (
                  <h3
                    key={index}
                    className="mb-3 mt-8 text-xl font-bold text-gray-900"
                  >
                    {block.text}
                  </h3>
                );
              case "quote":
                return (
                  <blockquote
                    key={index}
                    className="my-8 border-l-4 border-blue-600 bg-blue-50/50 p-6 italic text-gray-800 text-lg rounded-r-lg"
                  >
                    "{block.text}"
                    {block.author && (
                      <footer className="mt-4 text-sm font-semibold text-gray-600 not-italic">
                        — {block.author}
                      </footer>
                    )}
                  </blockquote>
                );
              case "image":
                return (
                  <figure key={index} className="my-10">
                    <img
                      src={block.src}
                      alt={block.alt || "Blog image"}
                      className="w-full rounded-xl"
                    />
                    {block.alt && (
                      <figcaption className="mt-3 text-center text-sm text-gray-500">
                        {block.alt}
                      </figcaption>
                    )}
                  </figure>
                );
              case "list":
                return (
                  <ul
                    key={index}
                    className="mb-6 list-disc pl-6 space-y-2 text-lg text-gray-800"
                  >
                    {block.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                );
              case "link":
                return (
                  <p key={index} className="mb-6">
                    <a
                      href={block.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {block.text}
                    </a>
                  </p>
                );
              default:
                return null;
            }
          })}
        </article>

        {/* Author Section with Social Links - UPDATED DESIGN */}
        <div className="mx-auto mt-20 max-w-3xl border-t border-gray-200 pt-10">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {post.author.photo ? (
              <img
                src={post.author.photo}
                alt={post.author.name}
                className="h-16 w-16 rounded-full object-cover shadow-sm"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl">
                {post.author.name.charAt(0)}
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-500">Written by</p>
              <h3 className="text-xl font-bold text-gray-900">
                {post.author.name}
              </h3>

              {/* Author Social Links - Clear layout */}
              {post.author.links && post.author.links.length > 0 && (
                <div className="mt-2 flex items-center gap-4">
                  {post.author.links.map(
                    (link, idx) =>
                      link.href && (
                        <a
                          key={idx}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {link.label}
                        </a>
                      ),
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <Link
            to="/blog"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all articles
          </Link>
        </div>
      </Container>
    </div>
  );
}
