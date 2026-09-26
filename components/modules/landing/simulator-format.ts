import type { PricingCurrency } from "@/lib/pricing";
import type { LandingLocale } from "./content";

/** Amounts on the pricing page, in the currency the visitor picked. */
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

/** The ticket-price field of the sale tab, in whole units of [currency] (dollars, not cents). */
export interface TicketPriceField {
  min: number;
  max: number;
  step: number;
  inputMax: number;
  initial: number;
  suffix: string;
  /** The typed price in the currency's minor unit. */
  toMinor: (price: number) => number;
}

const TICKET_PRICE_FIELDS: Record<PricingCurrency, TicketPriceField> = {
  GNF: { min: 1_000, max: 500_000, step: 1_000, inputMax: 10_000_000, initial: 50_000, suffix: "GNF", toMinor: (price) => price },
  FCFA: { min: 100, max: 50_000, step: 100, inputMax: 1_000_000, initial: 3_000, suffix: "FCFA", toMinor: (price) => price },
  USD: { min: 1, max: 500, step: 1, inputMax: 10_000, initial: 5, suffix: "USD", toMinor: (price) => price * 100 },
};

export function ticketPriceField(currency: PricingCurrency): TicketPriceField {
  return TICKET_PRICE_FIELDS[currency];
}
