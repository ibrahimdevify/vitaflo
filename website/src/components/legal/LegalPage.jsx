import { useMemo } from "react";
import Navbar from "../Navbar.jsx";
import GridBackdrop from "../ui/GridBackdrop.jsx";
import Container from "../ui/Container.jsx";
import Reveal from "../ui/Reveal.jsx";

// Reusable page for long legal text (Terms of Use, Privacy Policy, ...).
// The text lives in a plain .txt file: paragraphs are separated by a blank
// line, and a short line that starts with a number ("1. Not Medical Advice")
// becomes a heading, and so does a short ALL-CAPS line ("DATA RETENTION").
// A short opening sentence ("Arbitration. ...") is bolded.

const EMAIL = /([\w.+-]+@[\w-]+\.[\w.-]+[\w])/g;
const squash = (s) =>
  s
    .replace(/[\u200e\u200f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// "INFORMATION WE COLLECT", "HIPAA; DATA SECURITY": a short ALL-CAPS line.
// (Long ALL-CAPS legal notices are paragraphs, not headings.)
const isCapsHeading = (line) => {
  const l = line.trim();
  return (
    l.length >= 4 &&
    l.length <= 70 &&
    !/[a-z]/.test(l) &&
    /[A-Z]{3}/.test(l) &&
    !/[.!?]$/.test(l)
  );
};

const SMALL = new Set([
  "and",
  "or",
  "of",
  "for",
  "the",
  "to",
  "in",
  "on",
  "a",
  "an",
]);
const KEEP = new Set(["HIPAA", "CCPA", "PHI", "PII", "US", "USA"]);

// "THIRD-PARTY SITES AND USE" -> "Third-Party Sites and Use"
function titleCase(s) {
  return s
    .split(" ")
    .map((w, i) => {
      const bare = w.replace(/[^A-Za-z]/g, "");
      if (KEEP.has(bare)) return w;
      if (i > 0 && SMALL.has(bare.toLowerCase())) return w.toLowerCase();
      return w
        .toLowerCase()
        .replace(/(^|-)([a-z])/g, (_, a, b) => a + b.toUpperCase());
    })
    .join(" ");
}

// One cleaned-up block of text -> heading or paragraph (with optional bold lead)
function classify(b) {
  // "1. Not Medical Advice"
  const h = b.match(/^(\d+)[.,]\s+(.+)$/);
  if (h && b.length <= 90) {
    return { type: "h", text: `${h[1]}. ${h[2].replace(/\.$/, "")}` };
  }
  // "19, Third Party Application Stores. If you are ..."
  const n = b.match(/^(\d+[.,]\s+[^.]{3,60}\.)\s+(.+)$/);
  if (n) return { type: "p", lead: n[1], text: n[2] };
  // "(a) Device. A third party ..." / "Arbitration. Please read ..."
  const l = b.match(/^((?:\([a-z]\)\s+)?[A-Z][A-Za-z\-&; ]{2,70}?)\.\s+(.+)$/);
  if (l && l[1].replace(/^\([a-z]\)\s+/, "").split(" ").length <= 7) {
    return { type: "p", lead: `${l[1]}.`, text: l[2] };
  }
  return { type: "p", text: b };
}

function parse(text) {
  const out = [];
  for (const raw of text.split(/\n\s*\n/)) {
    let lines = raw.split("\n");
    while (lines.length && !lines[0].trim()) lines.shift();
    // ALL-CAPS heading, alone or on the line right above its paragraph
    if (lines.length && isCapsHeading(lines[0])) {
      out.push({ type: "h", text: titleCase(squash(lines[0])) });
      lines = lines.slice(1);
    }
    const b = squash(lines.join(" "));
    if (b) out.push(classify(b));
  }
  return out;
}

// Turns e-mail addresses inside a paragraph into mailto links.
function withLinks(str) {
  return str.split(EMAIL).map((part, i) =>
    i % 2 === 1 ? (
      <a
        key={i}
        href={`mailto:${part}`}
        className="text-[#2c4d77] underline underline-offset-2 hover:text-[#3a95f0]"
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}

export default function LegalPage({ company, title, updated, text }) {
  const blocks = useMemo(() => parse(text), [text]);

  return (
    <>
      <section className="hero-bg relative overflow-hidden pb-14 text-white lg:pb-[6vw]">
        <GridBackdrop />
        <Navbar />
        <Container className="relative z-10">
          <Reveal y={40} className="mt-10 lg:mt-[5vw]">
            {company && (
              <p className="m-0 mb-3 text-[clamp(13px,0.9vw,22px)] uppercase tracking-wide text-lime-vc lg:mb-[1vw]">
                {company}
              </p>
            )}
            <h1 className="m-0 text-[clamp(34px,4.4vw,110px)] font-normal leading-[1.1] tracking-[-0.025em]">
              {title}
            </h1>
            {updated && (
              <p className="m-0 mt-4 text-[clamp(14px,1.1vw,26px)] text-white/80 lg:mt-[1.4vw]">
                {updated}
              </p>
            )}
          </Reveal>
        </Container>
      </section>

      <section className="bg-[#faf9f7] py-12 text-[#2b2b2b] lg:py-[5vw]">
        <Container>
          <article className="mx-auto max-w-[820px] lg:max-w-[64vw]">
            {blocks.map((b, i) =>
              b.type === "h" ? (
                <h2
                  key={i}
                  className="m-0 mt-10 text-[clamp(20px,1.7vw,40px)] font-medium text-[#2c4d77] first:mt-0 lg:mt-[3vw]"
                >
                  {b.text}
                </h2>
              ) : (
                <p
                  key={i}
                  className="m-0 mt-4 text-[clamp(14px,1.02vw,22px)] leading-[1.75] text-[#2b2b2b] lg:mt-[1.1vw]"
                >
                  {b.lead && (
                    <strong className="font-semibold text-[#2c4d77]">
                      {b.lead}{" "}
                    </strong>
                  )}
                  {withLinks(b.text)}
                </p>
              ),
            )}
          </article>
        </Container>
      </section>
    </>
  );
}
