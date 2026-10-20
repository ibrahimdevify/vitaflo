import { Link } from "react-router-dom";

export default function BlogCard({ slug, title, image }) {
  return (
    <Link
      to={`/blog/${slug}`}
      className="group relative block aspect-[1/0.96] overflow-hidden rounded-[clamp(16px,1.3vw,32px)] bg-[#4a6f9a]"
    >
      {image && (
        <img
          src={image}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(53,87,124,0.12)_0%,rgba(53,87,124,0.5)_55%,rgba(44,77,119,0.92)_100%)]"
      />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white lg:p-[1.2vw]">
        <h3 className="m-0 line-clamp-2 text-[clamp(22px,2.1vw,52px)] font-normal leading-[1.2] tracking-[-0.02em]">
          {title}
        </h3>
        <span className="mt-2 block text-[clamp(14px,0.95vw,24px)] lg:mt-[0.5vw]">
          Read More
        </span>
      </div>
    </Link>
  );
}
