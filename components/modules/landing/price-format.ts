import type { PricingCurrency } from "@/lib/pricing";
import type { LandingLocale } from "./content";

/** Amounts in the pricing calculator, in the currency the visitor picked. */
export interface PriceFormat {
  currency: PricingCurrency;
  /** An amount in the currency's minor unit (whole francs, or US cents). */
  money: (amountMinor: number) => string;
  number: (value: number) => string;
}

export function priceFormat(locale: LandingLocale, currency: PricingCurrency): PriceFormat {
  const tag = locale === "fr" ? "fr-FR" : "en-US";
  const number = (value: number) => value.toLocaleString(tag, { maximumFractionDigits: 0 });
  const dollars = (cents: number) =>
    (cents / 100).toLocaleString(tag, { style: "currency", currency: "USD", maximumFractionDigits: cents % 100 === 0 ? 0 : 2 });
  return {
    currency,
    money: (amountMinor) =>
      currency === "USD" ? dollars(amountMinor) : `${number(amountMinor)} ${currency === "GNF" ? "GNF" : "FCFA"}`,
    number,
  };
}

/** The currency a visitor most likely pays in: Guinean francs in French, dollars in English. */
export function defaultCurrency(locale: LandingLocale): PricingCurrency {
  return locale === "fr" ? "GNF" : "USD";
}

/** Replaces `{name}` placeholders in a content string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);
}
