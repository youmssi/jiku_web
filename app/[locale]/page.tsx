import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { LANDING_CONTENT, LandingPage } from "@/components/modules/landing";
import { routing } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Landing page for both locales. The locale segment picks the content set; the
 * default locale (fr) serves at "/" and English at "/en" — exactly the URLs the
 * sitemap and hreflang alternates advertise.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;
  const content = LANDING_CONTENT[resolved];
  const canonical = resolved === routing.defaultLocale ? "/" : `/${resolved}`;

  return {
    title: content.meta.title,
    description: content.meta.description,
    keywords: content.meta.keywords,
    alternates: {
      canonical,
      languages: { fr: "/", en: "/en" },
    },
    openGraph: {
      type: "website",
      siteName: "Jikū",
      locale: resolved,
      title: content.meta.title,
      description: content.meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: content.meta.title,
      description: content.meta.description,
    },
  };
}

export default async function HomePage({ params }: Readonly<PageProps>) {
  const { locale } = await params;
  const resolved = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;
  setRequestLocale(resolved);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://jiku-web.vercel.app";
  return <LandingPage locale={resolved} siteUrl={siteUrl} />;
}
