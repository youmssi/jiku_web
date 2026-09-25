"use server";

import { getTranslations } from "next-intl/server";
import { serverFetch } from "@/lib/api-server";
import { reportApiError } from "@/lib/action-result";
import type {
  InvoiceSummary,
  ManualPaymentInstructions,
  OwnWhatsAppNumberView,
  PackView,
  SubscriptionRequestInput,
  SubscriptionView,
} from "./schema";

export async function requestActivationAction(
  eventId: string,
  tier: string,
): Promise<{ instructions?: ManualPaymentInstructions; error?: string }> {
  const response = await serverFetch(`/events/${eventId}/payments/manual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tier }),
  });
  const t = await getTranslations("billing.event.errors");
  if (response.status === 400) {
    return { error: t("unavailable") };
  }
  if (response.status === 401 || response.status === 403) {
    return { error: t("forbidden") };
  }
  if (response.status === 409) {
    return { error: t("owned") };
  }
  if (!response.ok) {
    reportApiError(response);
    return { error: t("failed") };
  }
  const instructions = (await response.json()) as ManualPaymentInstructions;
  return { instructions };
}

// ─── Subscription (JIKU-90) ──────────────────────────────────────────────────

/**
 * The tenant's subscription, or null when the tenant has none yet (e.g. no
 * active resource has ever opened one). A 404 simply means "nothing to show".
 */
export async function fetchSubscriptionAction(): Promise<SubscriptionView | null> {
  const response = await serverFetch("/billing/subscription");
  if (!response.ok) return null;
  return (await response.json()) as SubscriptionView;
}

export async function requestSubscriptionAction(
  input: SubscriptionRequestInput,
): Promise<{ ok: true; instructions: ManualPaymentInstructions } | { ok: false; error: string }> {
  const response = await serverFetch("/billing/subscription/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const t = await getTranslations("billing.subscription.errors");
  if (response.status === 400) {
    return { ok: false, error: t("unavailable") };
  }
  if (response.status === 409) {
    return { ok: false, error: t("tooSmall") };
  }
  if (!response.ok) {
    reportApiError(response);
    return { ok: false, error: t("failed") };
  }
  return { ok: true, instructions: (await response.json()) as ManualPaymentInstructions };
}

// ─── Own WhatsApp number (ADR 105) ───────────────────────────────────────────

export async function fetchOwnNumberAction(): Promise<OwnWhatsAppNumberView | null> {
  const response = await serverFetch("/billing/whatsapp-number");
  if (!response.ok) return null;
  return (await response.json()) as OwnWhatsAppNumberView;
}

/** Asks to pay for [months] of the "own WhatsApp number" add-on. */
export async function requestOwnNumberAction(
  months: number,
): Promise<{ ok: true; instructions: ManualPaymentInstructions } | { ok: false; error: string }> {
  const response = await serverFetch("/billing/whatsapp-number/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ months }),
  });
  const t = await getTranslations("billing.ownNumber.errors");
  if (response.status === 401 || response.status === 403) {
    return { ok: false, error: t("forbidden") };
  }
  if (response.status === 409) {
    return { ok: false, error: t("included") };
  }
  if (!response.ok) {
    reportApiError(response);
    return { ok: false, error: t("failed") };
  }
  return { ok: true, instructions: (await response.json()) as ManualPaymentInstructions };
}

// ─── Organizer Pack (ADR 105) ────────────────────────────────────────────────

export async function fetchPackAction(): Promise<PackView | null> {
  const response = await serverFetch("/billing/pack");
  if (!response.ok) return null;
  return (await response.json()) as PackView;
}

/** Asks to pay for [months] of pack (guests still owed included) or for [blocks] of extra guests. */
export async function requestPackAction(
  input: { months: number } | { blocks: number },
): Promise<{ ok: true; instructions: ManualPaymentInstructions } | { ok: false; error: string }> {
  const path = "months" in input ? "/billing/pack/request" : "/billing/pack/extra";
  const response = await serverFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const t = await getTranslations("billing.pack.errors");
  if (response.status === 401 || response.status === 403) {
    return { ok: false, error: t("forbidden") };
  }
  if (response.status === 409) {
    return { ok: false, error: t("inactive") };
  }
  if (!response.ok) {
    reportApiError(response);
    return { ok: false, error: t("failed") };
  }
  return { ok: true, instructions: (await response.json()) as ManualPaymentInstructions };
}

// ─── Invoices (JIKU-69) ─────────────────────────────────────────────────────

export async function fetchInvoicesAction(): Promise<InvoiceSummary[]> {
  const response = await serverFetch("/billing/invoices");
  if (!response.ok) return [];
  return (await response.json()) as InvoiceSummary[];
}

/**
 * Issues the invoice for a settled payment. The backend refuses until the
 * organization's legal details are complete, so that refusal is surfaced as its
 * own message pointing at Settings rather than a generic failure.
 */
export async function issueInvoiceAction(
  paymentId: string,
): Promise<{ ok: true; invoice: InvoiceSummary } | { ok: false; error: string }> {
  const response = await serverFetch(`/billing/invoices/payments/${paymentId}`, { method: "POST" });
  const t = await getTranslations("billing.actions");
  if (response.status === 409) {
    return { ok: false, error: t("legalDetails") };
  }
  if (!response.ok) {
    reportApiError(response);
    return { ok: false, error: t("invoiceFailed") };
  }
  return { ok: true, invoice: (await response.json()) as InvoiceSummary };
}

/** Note de crédit (JIKU-69/75) : corrige une facture en inversant son signe. */
export async function creditNoteAction(
  invoiceId: string,
): Promise<{ ok: true; invoice: InvoiceSummary } | { ok: false; error: string }> {
  const response = await serverFetch(`/billing/invoices/${invoiceId}/credit-note`, { method: "POST" });
  const t = await getTranslations("billing.actions");
  if (response.status === 409) {
    return { ok: false, error: t("creditTwice") };
  }
  if (!response.ok) {
    reportApiError(response);
    return { ok: false, error: t("creditFailed") };
  }
  return { ok: true, invoice: (await response.json()) as InvoiceSummary };
}
