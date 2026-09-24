// Public pricing model used by the /simulator playground. It mirrors the
// backend defaults in app/src/main/resources/application.yaml (billing.*) and
// app/.../money/internal/BillingProperties.kt — the same "mirror, don't invent"
// convention as components/modules/landing/content.ts. The authoritative price is
// always the backend's, recomputed when a tier is activated; these figures only
// estimate it for a visitor.

export interface PricingTier {
  name: string;
  /** Inclusive upper bound of guests this tier unlocks. */
  maxGuests: number;
  /** Price in GNF (GNF has no minor unit, so this is the full amount). */
  priceMinor: number;
}

export const PRICING = {
  currency: "GNF",
  freeTierGuests: 100,
  tiers: [
    { name: "BRONZE", maxGuests: 300, priceMinor: 150_000 },
    { name: "ARGENT", maxGuests: 600, priceMinor: 300_000 },
    { name: "OR", maxGuests: 1_000, priceMinor: 500_000 },
  ] satisfies PricingTier[],
  // CUSTOM tier (beyond the OR tier): $0.05/guest + $15 setup, converted at the
  // configured USD→GNF rate. Both move independently of a release.
  custom: {
    perGuestUsdCents: 5,
    setupFeeUsdCents: 1_500,
    usdToGnfRate: 8_760,
  },
} as const;

export const CUSTOM_TIER = "CUSTOM";
export const FREE_TIER = "FREE";

export interface Quote {
  tier: string;
  totalMinor: number;
  isCustom: boolean;
}

/** Custom-tier price in GNF for a guest count: variable sending + fixed setup. */
export function customPriceGnf(guestCount: number): number {
  const { perGuestUsdCents, setupFeeUsdCents, usdToGnfRate } = PRICING.custom;
  const totalUsdCents = perGuestUsdCents * guestCount + setupFeeUsdCents;
  return Math.round((totalUsdCents * usdToGnfRate) / 100);
}

/**
 * Tier + price for an estimated guest count. Free is a per-account allowance
 * over a rolling year, not per event; the paid tiers and CUSTOM apply to one
 * event. Returns an estimate only — never used to charge.
 */
export function quoteForGuests(guestCount: number): Quote {
  if (!Number.isFinite(guestCount) || guestCount <= 0) {
    return { tier: "", totalMinor: 0, isCustom: false };
  }
  if (guestCount <= PRICING.freeTierGuests) {
    return { tier: FREE_TIER, totalMinor: 0, isCustom: false };
  }
  const fixed = PRICING.tiers.find((tier) => guestCount <= tier.maxGuests);
  if (fixed) {
    return { tier: fixed.name, totalMinor: fixed.priceMinor, isCustom: false };
  }
  return { tier: CUSTOM_TIER, totalMinor: customPriceGnf(guestCount), isCustom: true };
}

/**
 * Marketing display rate (GNF per US dollar), mirroring the backend's CUSTOM
 * tier rate (billing.custom.usd-to-gnf-rate). Used ONLY to show an approximate
 * USD figure next to a GNF amount so a visitor can grasp the total; never to
 * charge.
 */
export const DISPLAY_GNF_PER_USD = PRICING.custom.usdToGnfRate;

/** Approximate US-dollar value of a GNF minor-unit amount. */
export function usdApprox(gnfMinor: number): number {
  return gnfMinor / DISPLAY_GNF_PER_USD;
}


// ─── Services subscription (ADR 104 §8, référentiel §6) ──────────────────────
// Billed per person who serves clients, per month. Administrators, entrance
// checkers and couriers are free. There is no limit on services, staff or
// clients per day; plans differ by features and by how many clients one
// resource may receive in the same slot (group sessions).

export type ServicePlanId = "solo" | "teams" | "organisation" | "enterprise";

export interface ServicePlanPricing {
  id: ServicePlanId;
  /** GNF per serving person per month; null = custom quote. */
  monthly: number | null;
  /** GNF per serving person per month when billed yearly; null when not offered. */
  yearly: number | null;
  /** Serving people covered; null = no cap. */
  maxServers: number | null;
  /** Clients one resource may receive in the same slot; null = on quote. */
  groupSize: number | null;
}

export const SERVICE_PLANS: readonly ServicePlanPricing[] = [
  { id: "solo", monthly: 0, yearly: null, maxServers: 1, groupSize: 1 },
  { id: "teams", monthly: 100_000, yearly: 90_000, maxServers: null, groupSize: 10 },
  { id: "organisation", monthly: 240_000, yearly: 200_000, maxServers: null, groupSize: 30 },
  { id: "enterprise", monthly: null, yearly: null, maxServers: null, groupSize: null },
];

export function servicePlan(id: ServicePlanId): ServicePlanPricing {
  const plan = SERVICE_PLANS.find((candidate) => candidate.id === id);
  if (!plan) throw new Error(`Unknown service plan: ${id}`);
  return plan;
}

export interface ServiceQuote {
  /** Per month for the whole team, at the chosen billing rhythm; null = on quote. */
  monthlyTotal: number | null;
  /** Per year for the whole team; null = on quote. */
  yearlyTotal: number | null;
  /** Saved per year by paying yearly; 0 when not offered. */
  yearlySaving: number;
}

export function quoteForService(id: ServicePlanId, servers: number, yearly: boolean): ServiceQuote {
  const plan = servicePlan(id);
  if (plan.monthly === null) return { monthlyTotal: null, yearlyTotal: null, yearlySaving: 0 };
  const count = Math.max(1, Math.round(servers));
  const perPerson = yearly && plan.yearly !== null ? plan.yearly : plan.monthly;
  const saving = plan.yearly !== null ? (plan.monthly - plan.yearly) * 12 * count : 0;
  return {
    monthlyTotal: perPerson * count,
    yearlyTotal: perPerson * count * 12,
    yearlySaving: yearly ? saving : 0,
  };
}

// ─── Ticket sales commission (ADR 104 §8, référentiel §7) ────────────────────
// 3 % of each ticket sold, paid to Jikū before the sale, one tranche at a
// time. Sales money goes straight to the organization.

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
