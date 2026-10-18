import { jsonLd } from "@/lib/json-ld";
import type { PricingContent } from "./pricing-content";
import { EVENT_PRICING, ORGANIZER_PACK, SERVICES_PRO } from "@/lib/pricing";

/**
 * Offers for the pricing page, built from the same figures the page shows, in
 * Guinean francs, the reference grid: the per-guest price and the two Pro
 * plans. The free offer and the quoted Enterprise plan carry no price.
 */
export function PricingJsonLd({ content, url }: { content: PricingContent; url: string }) {
  const unit = (id: string) => content.offers.find((offer) => offer.id === id);
  const offer = (id: string, gnf: number) => ({
    "@type": "Offer",
    name: unit(id)?.name ?? id,
    price: String(gnf),
    priceCurrency: "GNF",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: String(gnf),
      priceCurrency: "GNF",
      valueAddedTaxIncluded: true,
      unitText: unit(id)?.unit ?? "",
    },
  });
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Jikū",
    url,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: [
      offer("event", EVENT_PRICING.perGuest.gnf),
      offer("pack", ORGANIZER_PACK.monthly.gnf),
      offer("services", SERVICES_PRO.perPerson.gnf),
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />;
}
