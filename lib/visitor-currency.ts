import "server-only";
import { cookies, headers } from "next/headers";
import { COOKIES } from "@/lib/constants";
import { currencyForCountry, DEFAULT_CURRENCY, isPricingCurrency, type PricingCurrency } from "@/lib/pricing";

/**
 * The currency the marketing pages quote prices in (JIKU-270): the one the
 * visitor picked, else their country's (Cloudflare's CF-IPCountry in
 * production, Vercel's country header on previews), else the page language's.
 * Reading the request makes these pages render per request.
 */
export async function visitorCurrency(locale: "fr" | "en"): Promise<PricingCurrency> {
  const picked = (await cookies()).get(COOKIES.CURRENCY)?.value;
  if (isPricingCurrency(picked)) return picked;
  const requestHeaders = await headers();
  const country = requestHeaders.get("cf-ipcountry") ?? requestHeaders.get("x-vercel-ip-country");
  return currencyForCountry(country) ?? DEFAULT_CURRENCY[locale];
}
