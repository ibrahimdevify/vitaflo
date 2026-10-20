import { Link } from "react-router-dom";
import { img } from "../../data/blog.js";

// Article body for /blog/:slug. Understands every block type used in data/blog.js:
//   { h?, p?: [string...] }          heading and/or paragraphs
//   { image: "name", alt, href? }    picture from src/assets/blog (skipped if missing)
// Strings may contain the light markup used in blog.js: <a>/<ul>/<em> HTML,
// **bold**, *italic*, bare https:// links, and "• " bullet lines.
// The content is your own static data, so it is rendered as HTML.

const LINK = "text-[#2c4d77] underline underline-offset-2 hover:opacity-80";
const ROUTE_FIX = { "/demo": "/contact" }; // /demo is not a route in App.jsx

const format = (s) =>
  s
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(
      /(^|[\s(])(https?:\/\/[^\s<)]+)/g,
      `$1<a href="$2" target="_blank" rel="noreferrer" class="${LINK}">$2</a>`,
    );

const SMALL_HEADING = /^(references?|citations?|footnotes?|further learning)/i;

const H2 = "m-0 font-normal leading-[1.1] tracking-[-0.03em] text-[#0f0f0f]";
const bigHeading = (h) =>
  h.length > 42
    ? "text-[clamp(26px,2.5vw,64px)]"
    : "text-[clamp(30px,3.6vw,92px)]";

const TEXT =
  "text-[#0f0f0f] [&_a]:break-words [&_em]:italic [&_strong]:font-medium";
const P_BIG = `m-0 text-[clamp(16px,0.85vw,22px)] leading-[2] ${TEXT}`;
const P_SMALL = `m-0 text-[clamp(13px,0.72vw,18px)] leading-[1.7] text-[#0f0f0f]/80 [&_a]:break-words`;

function Html({ children, className }) {
  const Tag = children.includes("<ul") ? "div" : "p";
  return (
    <Tag
      className={`${className} [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6`}
      dangerouslySetInnerHTML={{ __html: format(children) }}
    />
  );
}

function Figure({ name, alt, href }) {
  const src = img(name);
  if (!src) return null;
  const pic = (
    <img
      src={src}
      alt={alt || ""}
      loading="lazy"
      className="mx-auto block h-auto w-full rounded-[clamp(12px,1vw,24px)] bg-white"
    />
  );
  const to = ROUTE_FIX[href] ?? href;
  return (
    <figure className="m-0 my-2 lg:my-[0.8vw]">
      {to ? <Link to={to}>{pic}</Link> : pic}
    </figure>
  );
}

function Paragraphs({ items = [], small }) {
  const cls = small ? P_SMALL : P_BIG;
  const out = [];
  let bullets = [];
  const flush = () => {
    if (bullets.length) out.push({ bullets });
    bullets = [];
  };
  items.forEach((t) => {
    if (typeof t !== "string" || t === "Image for post") return; // stray Medium text
    if (t.startsWith("• ")) bullets.push(t.slice(2));
    else {
      flush();
      out.push(t);
    }
  });
  flush();

  return out.map((item, i) =>
    item.bullets ? (
      <ul
        key={i}
        className={`m-0 list-disc pl-6 ${small ? "" : "lg:pl-[1.6vw]"} ${cls} marker:text-[#2c4d77]`}
      >
        {item.bullets.map((b, j) => (
          <li key={j} dangerouslySetInnerHTML={{ __html: format(b) }} />
        ))}
      </ul>
    ) : (
      <Html key={i} className={cls}>
        {item}
      </Html>
    ),
  );
}

export default function ArticleBody({ body = [] }) {
  return (
    <div>
      {body.map((s, i) => {
        const headingOnly = s.h && !s.p?.length && !s.image;
        const prevHeadingOnly =
          i > 0 &&
          body[i - 1].h &&
          !body[i - 1].p?.length &&
          !body[i - 1].image;
        const small = s.h && SMALL_HEADING.test(s.h);

        // Big gap before a new headed section; small gap otherwise.
        const gap =
          i === 0
            ? ""
            : s.h && !prevHeadingOnly
              ? "mt-14 lg:mt-[5vw]"
              : prevHeadingOnly
                ? "mt-5 lg:mt-[2vw]"
                : "mt-4 lg:mt-[1.2vw]";

        return (
          <section key={i} className={gap}>
            {s.h && (
              <h2
                className={`${H2} ${
                  small ? "text-[clamp(22px,1.9vw,48px)]" : bigHeading(s.h)
                }`}
              >
                {s.h}
              </h2>
            )}
            {!headingOnly && (
              <div
                className={`flex flex-col gap-4 lg:gap-[1.2vw] ${
                  s.h ? "mt-5 lg:mt-[2vw]" : ""
                } ${small ? "!gap-2 lg:!gap-[0.6vw]" : ""}`}
              >
                {s.image && <Figure name={s.image} alt={s.alt} href={s.href} />}
                <Paragraphs items={s.p} small={small} />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
