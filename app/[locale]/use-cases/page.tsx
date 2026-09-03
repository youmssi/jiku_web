import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { USE_CASES_CONTENT, UseCasesPage } from "@/components/modules/landing";
import { routing } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Dedicated use-cases page. The locale segment picks the content set; the
 * default locale (fr) serves at /use-cases and English at /en/use-cases.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const content = USE_CASES_CONTENT[resolved];
  const canonical = resolved === routing.defaultLocale ? "/use-cases" : `/${resolved}/use-cases`;

  return {
    title: content.meta.title,
    description: content.meta.description,
    keywords: content.meta.keywords,
    alternates: {
      canonical,
      languages: { fr: "/use-cases", en: "/en/use-cases" },
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

export default async function UseCasesPageRoute({ params }: Readonly<PageProps>) {
  const { locale } = await params;
  const resolved = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  setRequestLocale(resolved);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jiku-web.vercel.app";
  return <UseCasesPage content={USE_CASES_CONTENT[resolved]} locale={resolved} siteUrl={siteUrl} />;
}
