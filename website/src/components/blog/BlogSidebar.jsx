import { useId } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import BodyText from "../ui/BodyText.jsx";
import logo from "../../assets/logo.png";

const H2 =
  "m-0 text-[clamp(26px,2.05vw,52px)] font-normal leading-[1.2] tracking-[-0.02em] text-[#0f0f0f]";

// Compact row: small landscape photo + title + date. Also used for "Keep
// reading" on the article page.
export function PopularItem({ slug, title, image, date }) {
  return (
    <Link
      to={`/blog/${slug}`}
      className="group flex items-center gap-3 lg:gap-[0.8vw]"
    >
      <div className="relative aspect-[3/2] w-[30vw] shrink-0 overflow-hidden rounded-[clamp(10px,0.8vw,20px)] bg-[#4a6f9a] lg:w-[6.8vw]">
        {image && (
          <img
            src={image}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
          />
        )}
      </div>
      <div className="min-w-0">
        <h3 className="m-0 line-clamp-3 text-[clamp(14px,1vw,25px)] font-medium leading-[1.3] tracking-[-0.01em] text-[#2c4d77] transition-colors duration-300 group-hover:text-[#4a6fa0]">
          {title}
        </h3>
        {date && (
          <p className="m-0 mt-1 text-[clamp(12px,0.75vw,19px)] text-[#0f0f0f]/60 lg:mt-[0.3vw]">
            {date}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function BlogSidebar({
  tags,
  activeTag,
  onTag,
  query,
  onQuery,
  popular,
}) {
  const searchId = useId();

  return (
    <aside aria-label="Blog sidebar" className="min-w-0">
      {/* Topic tags: click to filter the list, click again to clear */}
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0 lg:gap-x-[0.27vw] lg:gap-y-[1.2vw]">
        {tags.map((t) => {
          const on = activeTag === t;
          return (
            <li key={t}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onTag(on ? null : t)}
                className={`inline-flex h-[clamp(44px,3.1vw,80px)] items-center rounded-full px-[clamp(18px,1.4vw,36px)] text-[clamp(15px,1vw,26px)] transition-colors duration-300 ${
                  on
                    ? "bg-lime-vc text-[#0f0f0f]"
                    : "bg-[#2c4d77] text-lime-vc hover:bg-[#3a6291]"
                }`}
              >
                {t}
              </button>
            </li>
          );
        })}
      </ul>

      <img
        src={logo}
        alt="VitalFlo"
        className="mt-10 h-[clamp(40px,3vw,76px)] w-auto lg:mt-[4.2vw]"
      />
      <BodyText className="mt-6 lg:mt-[2.9vw] lg:text-[clamp(14px,0.83vw,22px)]">
        Explore expert articles, practical guides, and science-backed resources
        designed to help you make informed decisions about your health and
        wellbeing.
      </BodyText>

      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="mt-5 lg:mt-[1.2vw]"
      >
        <label htmlFor={searchId} className="sr-only">
          Search articles
        </label>
        <div className="flex h-[clamp(52px,3.3vw,84px)] items-center gap-3 rounded-[clamp(10px,0.95vw,24px)] border-[1.5px] border-[#0f0f0f] px-[clamp(16px,1.4vw,36px)] focus-within:border-[#2c4d77] focus-within:ring-2 focus-within:ring-[#2c4d77]/30">
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search articles"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-[clamp(15px,1vw,26px)] text-[#0f0f0f] outline-none placeholder:text-[#9a9a9a] [&::-webkit-search-cancel-button]:hidden"
          />
          <Search
            aria-hidden="true"
            strokeWidth={1.6}
            className="h-[clamp(20px,1.4vw,34px)] w-[clamp(20px,1.4vw,34px)] shrink-0 text-[#6b6b6b]"
          />
        </div>
      </form>

      <h2 className={`${H2} mt-16 lg:mt-[8vw]`}>Popular Articles</h2>
      <div className="mt-6 rounded-[clamp(16px,1.5vw,36px)] bg-white p-4 lg:mt-[2.7vw] lg:p-[1.2vw]">
        <ul className="m-0 flex list-none flex-col gap-4 p-0 lg:gap-[1.2vw]">
          {popular.map((post) => (
            <li key={post.slug}>
              <PopularItem {...post} />
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
