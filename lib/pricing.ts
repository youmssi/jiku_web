// Public pricing model (ADR 105) used by the /simulator playground and the
// landing page. It mirrors the backend defaults (money/internal/BillingProperties
// and SubscriptionProperties) — the same "mirror, don't invent" convention as
// components/modules/landing/content.ts. The authoritative price is always the
// backend's, recomputed at payment; these figures only estimate it for a visitor.

/** The three currencies Jikū bills in. FCFA stands for both XOF and XAF, which carry the same amount. */
export const PRICING_CURRENCIES = ["GNF", "FCFA", "USD"] as const;
export type PricingCurrency = (typeof PRICING_CURRENCIES)[number];

/** One price, set by hand in each currency (round amounts, never converted). USD is in cents. */
export interface PriceList {
  gnf: number;
  fcfa: number;
  usdCents: number;
}

const FREE: PriceList = { gnf: 0, fcfa: 0, usdCents: 0 };

/** A price in [currency]'s minor unit: whole francs, or US cents. */
export function priceIn(price: PriceList, currency: PricingCurrency): number {
  if (currency === "GNF") return price.gnf;
  if (currency === "FCFA") return price.fcfa;
  return price.usdCents;
}

// ─── Events (ADR 105, decision 3) ──────────────────────────────────────────

export interface PricingTier {
  name: string;
  /** Inclusive upper bound of guests this tier unlocks. */
  maxGuests: number;
  price: PriceList;
}

export const EVENT_PRICING = {
  freeTierGuests: 100,
  tiers: [
    { name: "BRONZE", maxGuests: 300, price: { gnf: 225_000, fcfa: 15_000, usdCents: 2_500 } },
    { name: "ARGENT", maxGuests: 600, price: { gnf: 375_000, fcfa: 25_000, usdCents: 4_500 } },
    { name: "OR", maxGuests: 1_000, price: { gnf: 600_000, fcfa: 40_000, usdCents: 7_000 } },
  ] satisfies PricingTier[],
  /** Each guest beyond the last tier, added to that tier's price. */
  beyondPerGuest: { gnf: 500, fcfa: 35, usdCents: 6 } satisfies PriceList,
} as const;

export const CUSTOM_TIER = "CUSTOM";
export const FREE_TIER = "FREE";

/** How guests receive their ticket; the organizer chooses per event. */
export const DELIVERY_MODES = ["link", "direct", "interactive"] as const;
export type DeliveryMode = (typeof DELIVERY_MODES)[number];

/** Added per guest when invitations are interactive WhatsApp messages. */
export const INTERACTIVE_SURCHARGE: PriceList = { gnf: 150, fcfa: 10, usdCents: 2 };

export interface Quote {
  tier: string;
  /** The tier's price, or the last tier plus each guest beyond it. */
  baseMinor: number;
  /** The interactive WhatsApp supplement for these guests; 0 for the other modes. */
  surchargeMinor: number;
  totalMinor: number;
  isCustom: boolean;
}

/**
 * Tier and price of an event of [guestCount] guests. The free allowance
 * covers every delivery mode; the paid tiers and beyond apply to one event.
 * An estimate only — never used to charge.
 */
export function quoteForGuests(guestCount: number, currency: PricingCurrency, mode: DeliveryMode = "link"): Quote {
  if (!Number.isFinite(guestCount) || guestCount <= 0) {
    return { tier: "", baseMinor: 0, surchargeMinor: 0, totalMinor: 0, isCustom: false };
  }
  if (guestCount <= EVENT_PRICING.freeTierGuests) {
    return { tier: FREE_TIER, baseMinor: 0, surchargeMinor: 0, totalMinor: 0, isCustom: false };
  }
  const surchargeMinor = mode === "interactive" ? guestCount * priceIn(INTERACTIVE_SURCHARGE, currency) : 0;
  const fixed = EVENT_PRICING.tiers.find((tier) => guestCount <= tier.maxGuests);
  if (fixed) {
    const baseMinor = priceIn(fixed.price, currency);
    return { tier: fixed.name, baseMinor, surchargeMinor, totalMinor: baseMinor + surchargeMinor, isCustom: false };
  }
  const last = EVENT_PRICING.tiers[EVENT_PRICING.tiers.length - 1];
  const baseMinor =
    priceIn(last.price, currency) + (guestCount - last.maxGuests) * priceIn(EVENT_PRICING.beyondPerGuest, currency);
  return { tier: CUSTOM_TIER, baseMinor, surchargeMinor, totalMinor: baseMinor + surchargeMinor, isCustom: true };
}

/** Planners, agencies and venues: a monthly guest allowance across all their events. */
export const ORGANIZER_PACK = {
  monthly: { gnf: 600_000, fcfa: 40_000, usdCents: 7_000 } satisfies PriceList,
  includedGuests: 1_000,
  extraPerGuest: { gnf: 600, fcfa: 40, usdCents: 7 } satisfies PriceList,
} as const;

// ─── Services subscription (ADR 105, decision 2) ─────────────────────────────
// Priced for the team: a monthly price covering the included people, plus a
// price per extra person. Only people who serve clients count.

export type ServicePlanId = "solo" | "soloPlus" | "teams" | "organisation" | "enterprise";

export interface ServicePlanPricing {
  id: ServicePlanId;
  /** Monthly price covering [includedPeople]; null = custom quote. */
  monthly: PriceList | null;
  includedPeople: number;
  /** Most people the plan holds; null = no cap. */
  maxPeople: number | null;
  /** Each person beyond [includedPeople]; null when the plan takes no more. */
  extraPerson: PriceList | null;
  /** Clients one resource may receive in the same slot; null = on quote. */
  groupSize: number | null;
}

export const SERVICE_PLANS: readonly ServicePlanPricing[] = [
  { id: "solo", monthly: FREE, includedPeople: 1, maxPeople: 1, extraPerson: null, groupSize: 1 },
  {
    id: "soloPlus",
    monthly: { gnf: 50_000, fcfa: 3_500, usdCents: 600 },
    includedPeople: 1,
    maxPeople: 1,
    extraPerson: null,
    groupSize: 1,
  },
  {
    id: "teams",
    monthly: { gnf: 150_000, fcfa: 10_000, usdCents: 1_700 },
    includedPeople: 2,
    maxPeople: null,
    extraPerson: { gnf: 50_000, fcfa: 3_500, usdCents: 600 },
    groupSize: 10,
  },
  {
    id: "organisation",
    monthly: { gnf: 350_000, fcfa: 25_000, usdCents: 4_000 },
    includedPeople: 5,
    maxPeople: null,
    extraPerson: { gnf: 40_000, fcfa: 2_500, usdCents: 500 },
    groupSize: 30,
  },
  { id: "enterprise", monthly: null, includedPeople: 0, maxPeople: null, extraPerson: null, groupSize: null },
];

/** Paying yearly charges ten of the twelve months: two months free. */
export const YEARLY_CHARGED_MONTHS = 10;

export function servicePlan(id: ServicePlanId): ServicePlanPricing {
  const plan = SERVICE_PLANS.find((candidate) => candidate.id === id);
  if (!plan) throw new Error(`Unknown service plan: ${id}`);
  return plan;
}

/** Monthly price of [plan] for a team of [people] in [currency]; null on quote. */
export function teamMonthly(plan: ServicePlanPricing, people: number, currency: PricingCurrency): number | null {
  if (plan.monthly === null) return null;
  const extra = Math.max(0, Math.round(people) - plan.includedPeople);
  return priceIn(plan.monthly, currency) + extra * (plan.extraPerson ? priceIn(plan.extraPerson, currency) : 0);
}

export interface ServiceQuote {
  /** Monthly price for the whole team; null = on quote. */
  monthlyTotal: number | null;
  /** What a year costs at the chosen rhythm; null = on quote. */
  yearlyTotal: number | null;
  /** Saved over a year by paying yearly; 0 when paying monthly. */
  yearlySaving: number;
}

export function quoteForService(
  id: ServicePlanId,
  people: number,
  yearly: boolean,
  currency: PricingCurrency,
): ServiceQuote {
  const monthly = teamMonthly(servicePlan(id), Math.max(1, people), currency);
  if (monthly === null) return { monthlyTotal: null, yearlyTotal: null, yearlySaving: 0 };
  return {
    monthlyTotal: monthly,
    yearlyTotal: monthly * (yearly ? YEARLY_CHARGED_MONTHS : 12),
    yearlySaving: yearly ? monthly * (12 - YEARLY_CHARGED_MONTHS) : 0,
  };
}

// ─── Ticket sales commission (ADR 105, decision 4) ───────────────────────────
// 3 % of each ticket sold, paid to Jikū before the sale, one tranche at a
// time; the first tranche of an organization's first sale is free. Sales
// money goes straight to the organization.

export const TICKET_SALES = {
  commissionRate: 0.03,
  trancheSize: 50,
} as const;

export interface SalesQuote {
  /** Commission if every ticket sells. */
  commission: number;
  /** Commission of one tranche (never more tickets than are on sale). */
  perTranche: number;
  /** Number of tranches to cover every ticket. */
  tranches: number;
  /** What reaches the organization directly, before its own costs. */
  organizationRevenue: number;
}

export function quoteForSales(ticketPrice: number, ticketCount: number): SalesQuote {
  const price = Math.max(0, ticketPrice);
  const count = Math.max(0, Math.round(ticketCount));
  const perTicket = Math.round(price * TICKET_SALES.commissionRate);
  const trancheTickets = Math.min(TICKET_SALES.trancheSize, count);
  return {
    commission: perTicket * count,
    perTranche: perTicket * trancheTickets,
    tranches: count === 0 ? 0 : Math.ceil(count / TICKET_SALES.trancheSize),
    organizationRevenue: price * count,
  };
}
