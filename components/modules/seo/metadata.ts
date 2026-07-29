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

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://jiku-web.vercel.app";
}
