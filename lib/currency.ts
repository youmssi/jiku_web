// ISO 4217 currencies with no minor unit (ISO exponent 0) — GNF (this
// platform's currency, JIKU-53) and XOF (its prior default) both fall here, so
// `amountMinor` is the full amount for either, not centimes.
const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
]);

/** Formats a minor-unit amount for display, currency-aware (mirrors the backend's BillingHistoryController). */
export function formatAmount(minor: number, currency: string): string {
  if (ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase())) {
    return `${minor.toLocaleString(undefined, { minimumFractionDigits: 0 })} ${currency}`;
  }
  return `${(minor / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency}`;
}
