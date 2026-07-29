import type { LandingContent, LandingLocale } from "./content";

/**
 * Structured data for the landing page: Organization, SoftwareApplication (with
 * the real pay-per-event offer range in GNF), and FAQPage built from the same
 * FAQ content the visitor sees — the markup can never say something the page
 * does not.
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

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Jikū",
    url: siteUrl,
    logo: `${siteUrl}/icon-512.png`,
  };

  const application = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Jikū",
    url: pageUrl,
    description: content.meta.description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: locale,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "GNF",
      lowPrice: "0",
      highPrice: "500000",
      offerCount: 4,
    },
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: content.faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      {[organization, application, faq].map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
