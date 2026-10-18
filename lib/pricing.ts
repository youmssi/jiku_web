// Public pricing model (ADR 109) used by the /pricing page and the marketing
// pages. It mirrors the backend defaults (money/internal/BillingProperties
// and SubscriptionProperties) — the same "mirror, don't invent" convention as
// components/modules/landing/content.ts. The authoritative price is always the
// backend's, recomputed at payment; these figures only estimate it for a
// visitor. Every price includes all taxes.

/** The three currencies Jikū bills in. FCFA stands for both XOF and XAF, which carry the same amount. */
export const PRICING_CURRENCIES = ["GNF", "FCFA", "USD"] as const;
export type PricingCurrency = (typeof PRICING_CURRENCIES)[number];

/** One price, set by hand in each currency (round amounts, never converted). USD is in cents. */
export interface PriceList {
  gnf: number;
  fcfa: number;
  usdCents: number;
}

/** A price in [currency]'s minor unit: whole francs, or US cents. */
export function priceIn(price: PriceList, currency: PricingCurrency): number {
  if (currency === "GNF") return price.gnf;
  if (currency === "FCFA") return price.fcfa;
  return price.usdCents;
}

/** The free offer: guests a year across every event, and Solo for one person who serves clients. */
export const FREE_OFFER = {
  guestsPerYear: 100,
  soloWhatsAppReminders: 50,
} as const;

/** Per event: each guest at one price, every delivery mode included. */
export const EVENT_PRICING = {
  perGuest: { gnf: 750, fcfa: 50, usdCents: 8 } satisfies PriceList,
} as const;

/** Pro Organisateur: a monthly guest allowance across every event, for planners, agencies and venues. */
export const ORGANIZER_PACK = {
  monthly: { gnf: 600_000, fcfa: 40_000, usdCents: 7_000 } satisfies PriceList,
  includedGuests: 1_000,
  extraPerGuest: { gnf: 600, fcfa: 40, usdCents: 7 } satisfies PriceList,
} as const;

/** Services Pro: per person who serves clients, per month. */
export const SERVICES_PRO = {
  perPerson: { gnf: 60_000, fcfa: 4_000, usdCents: 700 } satisfies PriceList,
  groupSize: 30,
  remindersPerPerson: 1_000,
} as const;

/** Sending from the organization's own WhatsApp number, outside the Pro offers that include it. */
export const OWN_WHATSAPP_NUMBER = {
  monthly: { gnf: 100_000, fcfa: 7_000, usdCents: 1_200 } satisfies PriceList,
} as const;

/** Paying a year of a Pro offer charges ten of the twelve months: two months free. */
export const YEARLY_CHARGED_MONTHS = 10;

/** 3 % of each ticket sold; the first tranche of 50 tickets is free. */
export const TICKET_SALES = {
  commissionRate: 0.03,
  trancheSize: 50,
} as const;

/** What [guests] guests cost when each event pays for its own. */
export function perEventCost(guests: number, currency: PricingCurrency): number {
  return Math.max(0, Math.round(guests)) * priceIn(EVENT_PRICING.perGuest, currency);
}

/** What a month of Pro Organisateur costs for [guests] guests across the month's events. */
export function organizerPackCost(guests: number, currency: PricingCurrency): number {
  const extra = Math.max(0, Math.round(guests) - ORGANIZER_PACK.includedGuests);
  return priceIn(ORGANIZER_PACK.monthly, currency) + extra * priceIn(ORGANIZER_PACK.extraPerGuest, currency);
}

/** Guests a month from which Pro Organisateur costs no more than paying per event. */
export function organizerPackBreakEven(currency: PricingCurrency): number {
  return Math.ceil(priceIn(ORGANIZER_PACK.monthly, currency) / priceIn(EVENT_PRICING.perGuest, currency));
}
