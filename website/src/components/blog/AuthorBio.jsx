export default function AuthorBio({ author }) {
  if (!author) return null;

  return (
    <div className="mx-auto mt-16 max-w-[42rem] border-t border-black/10 pt-10 lg:mt-[6vw] lg:pt-[3vw]">
      <p className="m-0 text-[clamp(13px,0.85vw,19px)] text-[#4a6fa0]">
        Written by
      </p>

      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start lg:gap-[2vw]">
        {author.photo ? (
          <img
            src={author.photo}
            alt={author.name}
            loading="lazy"
            className="h-[72px] w-[72px] shrink-0 rounded-full object-cover lg:h-[5vw] lg:w-[5vw]"
          />
        ) : (
          <span className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-full bg-[#2c4d77] text-[clamp(20px,1.4vw,30px)] text-white lg:h-[5vw] lg:w-[5vw]">
            {author.name
              .replace(/^dr\.?\s+/i, "")
              .split(/[\s,]+/)
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase()}
          </span>
        )}

        <div className="min-w-0">
          <h3 className="m-0 text-[clamp(20px,1.5vw,32px)] font-medium leading-tight text-[#0f0f0f]">
            {author.name}
          </h3>
          {author.role && (
            <p className="m-0 mt-1 text-[clamp(14px,0.95vw,20px)] text-[#4a6fa0]">
              {author.role}
            </p>
          )}
          {author.bio && (
            <p className="m-0 mt-4 text-[clamp(14px,0.95vw,19px)] leading-[1.7] text-[#1f1f1f]">
              {author.bio}
            </p>
          )}

          {author.links?.length > 0 && (
            <ul className="m-0 mt-4 flex list-none gap-3 p-0">
              {author.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block rounded-full border border-[#2c4d77] px-4 py-2 text-[clamp(13px,0.9vw,18px)] text-[#2c4d77] transition hover:bg-[#2c4d77] hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
