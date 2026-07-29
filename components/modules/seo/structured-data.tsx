/**
 * Schema.org JSON-LD for the thematic marketing pages (JIKU-63). Deliberately
 * never emits `Event` markup — these are evergreen marketing pages, not a
 * specific organizer's event, and no `Event` schema is ever rendered on the
 * private per-event pages either (see JIKU-58's de-indexing work).
 */

interface BreadcrumbEntry {
  name: string;
  url: string;
}

export function OrganizationJsonLd({ siteUrl }: { siteUrl: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Jikū",
    url: siteUrl,
    logo: `${siteUrl}/icon-512.png`,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

/**
 * Jikū is a software product, not a physical venue — `LocalBusiness` here
 * describes the Conakry-based operator behind it (the story's target market),
 * not a bookable location. `areaServed` is what actually carries the local
 * relevance search engines look for.
 */
export function LocalBusinessJsonLd({ siteUrl }: { siteUrl: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Jikū",
    url: siteUrl,
    image: `${siteUrl}/icon-512.png`,
    areaServed: {
      "@type": "City",
      name: "Conakry",
      containedInPlace: { "@type": "Country", name: "Guinée" },
    },
    priceRange: "GNF",
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbEntry[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function FaqJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "fr",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
