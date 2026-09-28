import { EVENT_PRICING, SERVICE_PLANS, type PriceList } from "@/lib/pricing";
import type { LandingLocale, LandingPriceAnchor } from "./content";

const ANCHORS: Record<Exclude<LandingPriceAnchor, null>, () => PriceList | null> = {
  firstEventTier: () => EVENT_PRICING.tiers[0].price,
  teams: () => SERVICE_PLANS.find((plan) => plan.id === "teams")?.monthly ?? null,
};

/**
 * A published price as a pricing caption quotes it: francs first in French,
 * dollars first in English, the other currency in brackets. The figures come
 * from `lib/pricing.ts`, so the landing and the simulator never disagree.
 */
export function priceAnchor(anchor: LandingPriceAnchor, locale: LandingLocale): string {
  const price = anchor ? ANCHORS[anchor]() : null;
  if (!price) return "";
  if (locale === "fr") {
    const francs = new Intl.NumberFormat("fr-FR");
    return `${francs.format(price.gnf)} GNF (${francs.format(price.fcfa)} FCFA)`;
  }
  const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  return `${dollars.format(price.usdCents / 100)} (${new Intl.NumberFormat("en-US").format(price.gnf)} GNF)`;
}
