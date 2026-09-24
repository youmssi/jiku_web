import { PRICING, SERVICE_PLANS } from "@/lib/pricing";
import type { SimulatorContent } from "./simulator-content";

/**
 * Offers for the pricing page, built from the same figures the calculator
 * uses: the Services plans (per person, per month) and the event tiers.
 * Custom-quoted offers carry no price and are left out.
 */
export function PricingJsonLd({ content, url }: { content: SimulatorContent; url: string }) {
  const plans = SERVICE_PLANS.filter((plan) => plan.monthly !== null).map((plan) => ({
    "@type": "Offer",
    name: content.services.plans.find((candidate) => candidate.id === plan.id)?.name ?? plan.id,
    price: String(plan.monthly),
    priceCurrency: PRICING.currency,
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: String(plan.monthly),
      priceCurrency: PRICING.currency,
      unitText: content.services.perPersonMonth,
    },
  }));
  const tiers = PRICING.tiers.map((tier) => ({
    "@type": "Offer",
    name: tier.name,
    price: String(tier.priceMinor),
    priceCurrency: PRICING.currency,
  }));
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Jikū",
    url,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: [...plans, ...tiers],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
