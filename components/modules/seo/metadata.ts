/**
 * The public origin every canonical URL, sitemap entry and structured-data link
 * is built on. NEXT_PUBLIC_SITE_URL wins; on Vercel the project's production
 * domain is the fallback. Anything else fails the build rather than publish
 * links to a guessed host.
 */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  throw new Error("NEXT_PUBLIC_SITE_URL is not set: canonical URLs, the sitemap and structured data need the public origin.");
}
