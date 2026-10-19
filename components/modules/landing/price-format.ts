import type { PricingCurrency } from "@/lib/pricing";
import type { LandingLocale } from "./content";
import { formatAmount } from "./price-anchor";

/** Amounts in the pricing calculator, in the currency the page quotes. */
export interface PriceFormat {
  currency: PricingCurrency;
  /** An amount in the currency's minor unit (whole francs, or US cents). */
  money: (amountMinor: number) => string;
  number: (value: number) => string;
}

export function priceFormat(locale: LandingLocale, currency: PricingCurrency): PriceFormat {
  const tag = locale === "fr" ? "fr-FR" : "en-US";
  return {
    currency,
    money: (amountMinor) => formatAmount(amountMinor, locale, currency),
    number: (value) => value.toLocaleString(tag, { maximumFractionDigits: 0 }),
  };
}

/** Replaces `{name}` placeholders in a content string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);
}
