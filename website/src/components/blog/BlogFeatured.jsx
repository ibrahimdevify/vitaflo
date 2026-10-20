import { Link } from "react-router-dom";

// Big featured post: photo with the title, author, date and read time on it.
export default function BlogFeatured({
  slug,
  category,
  title,
  author,
  date,
  readTime,
  image,
}) {
  return (
    <Link
      to={`/blog/${slug}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-[clamp(16px,1.3vw,32px)] bg-[#4a6f9a] sm:aspect-[4/3] lg:aspect-[1152/840]"
    >
      {image && (
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(74,111,154,0)_38%,rgba(74,111,154,0.55)_68%,rgba(53,87,124,0.9)_100%)]"
      />

      <div className="absolute inset-x-0 bottom-0 p-5 text-white lg:px-[2.4vw] lg:pb-[2.6vw] lg:pt-0">
        <p className="m-0 text-[clamp(14px,0.95vw,24px)] text-white/90">
          {category}
        </p>
        <h2 className="m-0 mt-2 text-[clamp(22px,1.95vw,50px)] font-normal leading-[1.25] tracking-[-0.02em] lg:mt-[0.5vw]">
          {title}
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-[clamp(13px,0.9vw,23px)] text-white/90 lg:mt-[0.9vw] lg:gap-x-[2.4vw]">
          <span>By {author}</span>
          <span className="flex gap-[0.6em]">
            <span>{date}</span>
            <span>{readTime}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
