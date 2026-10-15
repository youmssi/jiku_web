/**
 * Schema.org JSON-LD for the marketing pages (JIKU-63, JIKU-239). Deliberately
 * never emits `Event` markup — these are evergreen marketing pages, not a
 * specific organizer's event, and no `Event` schema is ever rendered on the
 * private per-event pages either (see JIKU-58's de-indexing work).
 */

interface BreadcrumbEntry {
  name: string;
  url: string;
}

/** Stable identifiers, so every page's markup points at one organization and one site. */
export const organizationId = (siteUrl: string) => `${siteUrl}/#organization`;
export const websiteId = (siteUrl: string) => `${siteUrl}/#website`;

/** A comma-separated list from the environment, empty entries dropped. */
function listFromEnv(value: string | undefined): string[] {
  return (value ?? "").split(",").map((entry) => entry.trim()).filter(Boolean);
}

/**
 * Who Jikū is, for search engines building a brand panel: one Organization and
 * the WebSite it publishes, linked by `@id`. `alternateName` carries "Jiku"
 * because most people type the name without the macron. `sameAs` lists the
 * brand's official profiles (NEXT_PUBLIC_BRAND_PROFILES) and the publisher is
 * the company behind the product (NEXT_PUBLIC_PUBLISHER_NAME and _URL); each
 * is left out until it is configured. Rendered once, in the root layout.
 */
export function SiteJsonLd({ siteUrl }: { siteUrl: string }) {
  const profiles = listFromEnv(process.env.NEXT_PUBLIC_BRAND_PROFILES);
  const publisherName = process.env.NEXT_PUBLIC_PUBLISHER_NAME;
  const publisherUrl = process.env.NEXT_PUBLIC_PUBLISHER_URL;
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

  const organization = {
    "@type": "Organization",
    "@id": organizationId(siteUrl),
    name: "Jikū",
    alternateName: "Jiku",
    url: siteUrl,
    logo: { "@type": "ImageObject", url: `${siteUrl}/jiku-logo-1024.png`, width: 1024, height: 1024 },
    image: `${siteUrl}/opengraph-image`,
    areaServed: { "@type": "Country", name: "Guinea" },
    ...(supportEmail && {
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: supportEmail,
        availableLanguage: ["French", "English"],
      },
    }),
    ...(profiles.length > 0 && { sameAs: profiles }),
    ...(publisherName && {
      parentOrganization: { "@type": "Organization", name: publisherName, ...(publisherUrl && { url: publisherUrl }) },
    }),
  };

  const website = {
    "@type": "WebSite",
    "@id": websiteId(siteUrl),
    name: "Jikū",
    alternateName: "Jiku",
    url: siteUrl,
    inLanguage: ["fr", "en"],
    publisher: { "@id": organizationId(siteUrl) },
  };

  const schema = { "@context": "https://schema.org", "@graph": [organization, website] };
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

export function FaqJsonLd({ items, locale = "fr" }: { items: { question: string; answer: string }[]; locale?: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
