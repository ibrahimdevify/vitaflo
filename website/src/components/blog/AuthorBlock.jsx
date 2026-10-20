import { ArrowUpRight } from "lucide-react";
import { authorLinks } from "../../data/authors.js";

// "Written by" block at the end of an article: photo, name and social links.
export default function AuthorBlock({ name, photo, className = "" }) {
  const links = authorLinks(name);
  const initial = (name || "?").replace(/^Dr\.?\s+/i, "").charAt(0);

  return (
    <div className={`flex items-start gap-5 lg:gap-[1.6vw] ${className}`}>
      {photo ? (
        <img
          src={photo}
          alt={name}
          loading="lazy"
          className="h-20 w-20 shrink-0 rounded-full object-cover lg:h-[6vw] lg:w-[6vw]"
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[#4a6f9a] text-2xl text-white lg:h-[6vw] lg:w-[6vw] lg:text-[2vw]"
        >
          {initial}
        </span>
      )}

      <div className="min-w-0">
        <p className="m-0 text-[clamp(14px,0.95vw,24px)] text-[#2c4d77]">
          Written by
        </p>
        <p className="m-0 mt-1 text-[clamp(22px,1.9vw,48px)] font-normal leading-[1.2] text-[#0f0f0f] lg:mt-[0.3vw]">
          {name}
        </p>

        {links.length > 0 && (
          <ul className="m-0 mt-3 flex list-none flex-col gap-1 p-0 lg:mt-[0.8vw] lg:gap-[0.4vw]">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-[clamp(15px,1vw,26px)] text-[#2c4d77] underline-offset-4 transition-colors hover:text-[#1f3a5c] hover:underline"
                >
                  {l.label}
                  <ArrowUpRight
                    className="h-[1em] w-[1em]"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
