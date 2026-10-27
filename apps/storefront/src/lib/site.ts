/**
 * Public site URL, used for canonical links, the sitemap and structured
 * data. Set NEXT_PUBLIC_SITE_URL to the production domain (no trailing slash).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Trim text to a search-snippet-friendly length on a word boundary. */
export function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, clean.lastIndexOf(" ", max - 1))}…`;
}

/** Render a schema.org object as a JSON-LD script tag's contents. */
export function jsonLd(data: object): { __html: string } {
  // Escape "<" so product text can't close the script tag.
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
