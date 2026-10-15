import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { DOCS_META, DocsArticle, docsPageMeta, docsStaticParams } from "@/components/modules/docs";
import { languageAlternates, SHARE_IMAGE } from "@/components/modules/seo";
import { routing } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: string; slug?: string[] }>;
}

function resolveLocale(locale: string) {
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
}

export function generateStaticParams() {
  return docsStaticParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = resolveLocale(raw);
  const meta = docsPageMeta(locale, slug);
  if (!meta) notFound();
  const path = meta.url.replace(/^\/en(?=\/)/, "");
  const title = slug?.length ? meta.title : DOCS_META[locale].title;
  const description = meta.description || DOCS_META[locale].description;
  return {
    title,
    description,
    alternates: { canonical: meta.url, languages: languageAlternates(path) },
    openGraph: { type: "article", siteName: "Jikū", locale, title, description, images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [SHARE_IMAGE.url] },
  };
}

/** One guide: /docs/... in French, /en/docs/... in English. */
export default async function DocsRoute({ params }: PageProps) {
  const { locale: raw, slug } = await params;
  const locale = resolveLocale(raw);
  setRequestLocale(locale);
  return <DocsArticle locale={locale} slug={slug} />;
}
