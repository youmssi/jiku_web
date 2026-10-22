import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { PRICING_CONTENT, PricingPage, pricingContent } from "@/components/modules/landing";
import { languageAlternates, SHARE_IMAGE, siteUrl } from "@/components/modules/seo";
import { routing } from "@/i18n/routing";
import { SEO_ROUTES } from "@/lib/constants";
import { visitorCurrency } from "@/lib/visitor-currency";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Pricing. The locale segment picks the content set; the default locale (fr)
 * serves at /pricing and English at /en/pricing.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const content = PRICING_CONTENT[resolved];
  const canonical = resolved === routing.defaultLocale ? "/pricing" : `/${resolved}/pricing`;

  return {
    title: content.meta.title,
    description: content.meta.description,
    alternates: {
      canonical,
      languages: languageAlternates(SEO_ROUTES.PRICING),
    },
    openGraph: {
      type: "website",
      images: [SHARE_IMAGE],
      siteName: "Jikū",
      locale: resolved,
      title: content.meta.title,
      description: content.meta.description,
    },
    twitter: {
      card: "summary_large_image",
      images: [SHARE_IMAGE.url],
      title: content.meta.title,
      description: content.meta.description,
    },
  };
}

export default async function PricingPageRoute({ params }: Readonly<PageProps>) {
  const { locale } = await params;
  const resolved = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  setRequestLocale(resolved);
  const currency = await visitorCurrency(resolved);
  return <PricingPage content={pricingContent(resolved, currency)} locale={resolved} siteUrl={siteUrl()} currency={currency} />;
}
