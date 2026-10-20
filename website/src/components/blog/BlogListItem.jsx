import { Link } from "react-router-dom";

// One row of the hero's post list: small category + big title.
export default function BlogListItem({ slug, category, title }) {
  return (
    <Link to={`/blog/${slug}`} className="group block text-white">
      <p className="m-0 text-[clamp(14px,0.95vw,24px)] leading-[1.4] text-white/90">
        {category}
      </p>
      <h2 className="m-0 mt-1 text-[clamp(22px,1.95vw,50px)] font-normal leading-[1.28] tracking-[-0.02em] transition-colors duration-300 group-hover:text-lime-vc lg:mt-[0.5vw]">
        {title}
      </h2>
    </Link>
  );
}
