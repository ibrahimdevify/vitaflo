import { BLOG_FEATURED, BLOG_ARTICLES, getPost } from "./blog.js";

// Finds a post for /blog/:slug even when the URL uses a short slug
// (e.g. "doktorconnect-acquires-vitalflo") while blog.js builds the long one
// from the title ("vitalflo-is-acquired-by-doktorconnect-to-integrate-...").
//
// 1. exact slug  -> that post
// 2. otherwise   -> the post whose title contains every word of the URL
//                   (plural / -ed / -ing endings are ignored)
// BlogPost redirects to the real slug, so the address bar ends up canonical.

const ALL = [BLOG_FEATURED, ...BLOG_ARTICLES];

const stem = (w) => w.replace(/(ing|ed|es|s)$/, "");
const words = (s) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map(stem);

const INDEX = ALL.map((p) => ({ slug: p.slug, set: new Set(words(p.title)) }));

export function findPost(slug = "") {
  const exact = getPost(slug);
  if (exact) return exact;

  const want = words(slug);
  if (want.length < 2) return null;

  const hits = INDEX.filter((p) => want.every((w) => p.set.has(w)));
  if (!hits.length) return null;

  hits.sort((a, b) => a.set.size - b.set.size); // tightest title wins
  return getPost(hits[0].slug);
}
