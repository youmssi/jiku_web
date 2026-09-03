import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { SIMULATOR_CONTENT, SimulatorPage } from "@/components/modules/landing";
import { routing } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Pricing simulator. The locale segment picks the content set; the default
 * locale (fr) serves at /simulator and English at /en/simulator.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const content = SIMULATOR_CONTENT[resolved];
  const canonical = resolved === routing.defaultLocale ? "/simulator" : `/${resolved}/simulator`;

  return {
    title: content.meta.title,
    description: content.meta.description,
    alternates: {
      canonical,
      languages: { fr: "/simulator", en: "/en/simulator" },
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

export default async function SimulatorPageRoute({ params }: Readonly<PageProps>) {
  const { locale } = await params;
  const resolved = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  setRequestLocale(resolved);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jiku-web.vercel.app";
  return <SimulatorPage content={SIMULATOR_CONTENT[resolved]} locale={resolved} siteUrl={siteUrl} />;
}
