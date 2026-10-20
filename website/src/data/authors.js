// Social links of the blog authors. The key is the author's name WITHOUT
// titles (no "PhD", no "Dr.") in lower case. Add a person here and their
// links show up under "Written by" on every article they wrote.
const AUTHOR_LINKS = {
  "luke marshall": [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/lukegmarshall/" },
    // Add Luke's real Medium page here if you have it:
    // { label: "Medium", href: "https://medium.com/@..." },
  ],
  "nyx robey": [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/nyxrobey/" },
  ],
  "alicia chen": [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/alicia--chen/" },
  ],
  "the vitalflo team": [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/vitalflohealth/home/",
    },
    { label: "Twitter", href: "https://x.com/vitalflohealth" },
  ],
  // "andy taylor": [{ label: "LinkedIn", href: "..." }],
  // "ryan kelley": [{ label: "LinkedIn", href: "..." }],
};

const clean = (name = "") =>
  name
    .split(",")[0] // "Luke Marshall, PhD" -> "Luke Marshall"
    .replace(/^dr\.?\s+/i, "")
    .trim()
    .toLowerCase();

export const authorLinks = (name) => AUTHOR_LINKS[clean(name)] ?? [];
