import type { Metadata } from "next";

/**
 * `generateMetadata` builder shared by the JIKU-63 thematic pages. Canonical
 * always points at the French (unprefixed) URL regardless of which locale
 * segment served the request: these pages are French/Conakry-market keyword
 * targets with no separate English translation (same choice already made for
 * `/privacy`), so the `/en/...` URL must not compete with it as duplicate
 * content. `og:locale` is `fr_GN` — the story's explicit requirement, since
 * the generic root layout default is a plain `fr`.
 */
export function buildThematicMetadata({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      siteName: "Jikū",
      locale: "fr_GN",
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

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
