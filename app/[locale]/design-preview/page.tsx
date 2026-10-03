import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { DesignPreview } from "@/components/modules/landing";
import { siteUrl } from "@/components/modules/seo";
import { routing } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/** Design prototype for the marketing pages (JIKU-221); never indexed. */
export const metadata: Metadata = {
  title: "Design preview",
  robots: { index: false, follow: false },
};

export default async function DesignPreviewRoute({ params }: Readonly<PageProps>) {
  const { locale } = await params;
  const resolved = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  setRequestLocale(resolved);
  return <DesignPreview locale={resolved} siteUrl={siteUrl()} />;
}
