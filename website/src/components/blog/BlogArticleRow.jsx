import { Link } from "react-router-dom";
import AuthorChip from "./AuthorChip.jsx";

// Latest Articles row: landscape photo left; date, title, subtitle, summary
// and the author (photo + "Written by") on the right.
export default function BlogArticleRow({
  slug,
  category,
  title,
  subtitle,
  summary,
  excerpt,
  date,
  image,
  author,
  authorPhoto,
}) {
  const text = summary || excerpt;

  return (
    <Link
      to={`/blog/${slug}`}
      className="group grid gap-5 lg:grid-cols-[17.5vw_1fr] lg:gap-[1.9vw]"
    >
      <div className="relative aspect-[3/2] self-start overflow-hidden rounded-[clamp(12px,1vw,26px)] bg-[#4a6f9a]">
        {image && (
          <img
            src={image}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
          />
        )}
      </div>

      <div className="flex min-w-0 flex-col lg:min-h-[11.67vw]">
        <p className="m-0 text-[clamp(13px,0.85vw,22px)] leading-[1.4] text-[#0f0f0f]">
          {date}
          <span className="text-[#0f0f0f]/55"> &middot; {category}</span>
        </p>
        <h3 className="m-0 mt-1 text-[clamp(20px,1.55vw,40px)] font-medium leading-[1.25] tracking-[-0.02em] text-[#2c4d77] transition-colors duration-300 group-hover:text-[#4a6fa0] lg:mt-[0.3vw]">
          {title}
        </h3>
        {subtitle && (
          <p className="m-0 mt-2 text-[clamp(14px,0.95vw,24px)] leading-[1.45] text-[#4a6fa0] lg:mt-[0.5vw]">
            {subtitle}
          </p>
        )}
        {text && (
          <p className="m-0 mt-2 line-clamp-3 text-[clamp(13px,0.8vw,21px)] leading-[1.6] text-[#4a6fa0] lg:mt-[0.5vw]">
            {text}
          </p>
        )}

        <AuthorChip
          name={author}
          photo={authorPhoto}
          className="mt-5 lg:mt-auto lg:pt-[1.1vw]"
        />
      </div>
    </Link>
  );
}
