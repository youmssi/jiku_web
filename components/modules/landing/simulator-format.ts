import { usdApprox } from "@/lib/pricing";
import type { LandingLocale } from "./content";

/** Amounts on the pricing page: whole Guinean francs, with a rough dollar figure beside them. */
export interface PriceFormat {
  gnf: (amount: number) => string;
  usd: (amount: number) => string;
  number: (value: number) => string;
}

export function priceFormat(locale: LandingLocale, usdPrefix: string): PriceFormat {
  const tag = locale === "fr" ? "fr-FR" : "en-US";
  const number = (value: number) => value.toLocaleString(tag, { maximumFractionDigits: 0 });
  return {
    gnf: (amount) => `${number(amount)} GNF`,
    usd: (amount) => `${usdPrefix}${number(usdApprox(amount))}`,
    number,
  };
}

/** Replaces `{name}` placeholders in a content string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);
}
