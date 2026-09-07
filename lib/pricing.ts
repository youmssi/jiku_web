// Public pricing model used by the /simulator playground. It mirrors the
// backend defaults in app/src/main/resources/application.yaml (billing.*) and
// app/.../money/internal/BillingProperties.kt — the same "mirror, don't invent"
// convention as components/modules/landing/content.ts. The authoritative price
// is always recomputed server-side at reservation time (GET /bookings/quote),
// so any drift here is corrected the moment the visitor actually reserves.

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
  depositRate: 0.3,
} as const;

export const CUSTOM_TIER = "CUSTOM";
export const FREE_TIER = "FREE";

export interface Quote {
  tier: string;
  totalMinor: number;
  depositMinor: number;
  balanceMinor: number;
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
    return { tier: "", totalMinor: 0, depositMinor: 0, balanceMinor: 0, isCustom: false };
  }
  if (guestCount <= PRICING.freeTierGuests) {
    return { tier: FREE_TIER, totalMinor: 0, depositMinor: 0, balanceMinor: 0, isCustom: false };
  }
  const fixed = PRICING.tiers.find((tier) => guestCount <= tier.maxGuests);
  if (fixed) {
    const totalMinor = fixed.priceMinor;
    const depositMinor = Math.round(totalMinor * PRICING.depositRate);
    return {
      tier: fixed.name,
      totalMinor,
      depositMinor,
      balanceMinor: totalMinor - depositMinor,
      isCustom: false,
    };
  }
  const totalMinor = customPriceGnf(guestCount);
  return {
    tier: CUSTOM_TIER,
    totalMinor,
    depositMinor: 0,
    balanceMinor: totalMinor,
    isCustom: true,
  };
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

