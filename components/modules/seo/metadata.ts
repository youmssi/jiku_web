import type { Metadata } from "next";

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

/**
 * The site's share image (app/opengraph-image.tsx). A page that declares its
 * own `openGraph` replaces the one inherited from the file, so every marketing
 * page names it explicitly; without it, a link pasted in WhatsApp shows no
 * picture.
 */
export const SHARE_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "Jikū" };

/**
 * The hreflang alternates of a page served at [path] in both locales. The
 * unprefixed French page is also the `x-default`, the one search engines show
 * to a visitor whose language matches neither.
 */
export function languageAlternates(path: string): Record<string, string> {
  const en = path === "/" ? "/en" : `/en${path}`;
  return { fr: path, en, "x-default": path };
}

/**
 * Metadata of a page served in both locales at [path] (fr unprefixed, en under
 * /en): its own title and description, the canonical URL of [locale] and the
 * hreflang alternates. [index] false keeps the page out of search results
 * while its links are still followed.
 */
export function localizedPageMetadata({
  locale,
  defaultLocale,
  path,
  title,
  description,
  index = true,
}: {
  locale: string;
  defaultLocale: string;
  path: string;
  title: string;
  description: string;
  index?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: locale === defaultLocale ? path : `/${locale}${path}`,
      languages: languageAlternates(path),
    },
    robots: { index, follow: true },
    openGraph: { type: "website", siteName: "Jikū", locale, title, description, images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [SHARE_IMAGE.url] },
  };
}
