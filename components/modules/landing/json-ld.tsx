import { organizationId } from "@/components/modules/seo";
import { ORGANIZER_PACK } from "@/lib/pricing";
import type { LandingContent, LandingLocale } from "./content";
import { jsonLd } from "@/lib/json-ld";

/**
 * Structured data for the landing page: SoftwareApplication (with the
 * published event tier range in GNF), published by the site-wide Organization
 * (SiteJsonLd in the root layout), and FAQPage built from the same FAQ content
 * the visitor sees — the markup can never say something the page does not.
 */
export function LandingJsonLd({
  content,
  locale,
  siteUrl,
}: {
  content: LandingContent;
  locale: LandingLocale;
  siteUrl: string;
}) {
  const pageUrl = locale === "fr" ? siteUrl : `${siteUrl}/en`;

  const application = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Jikū",
    url: pageUrl,
    description: content.meta.description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: locale,
    publisher: { "@id": organizationId(siteUrl) },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "GNF",
      lowPrice: "0",
      highPrice: String(ORGANIZER_PACK.monthly.gnf),
      offerCount: 4,
    },
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: content.faq.items.filter((item) => item.featured).map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      {[application, faq].map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
        />
      ))}
    </>
  );
}
