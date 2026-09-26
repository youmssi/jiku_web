"use server";

import { getTranslations } from "next-intl/server";
import { serverFetch } from "@/lib/api-server";
import { fail, ok, reportApiError, type ActionResult } from "@/lib/action-result";
import type {
  CheckoutTarget,
  InvoiceSummary,
  ManualPaymentInstructions,
  PaymentInitiationResult,
  PaymentStatusView,
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

// ─── Online checkout (JIKU-165) ─────────────────────────────────────────────

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function checkoutRequest(target: CheckoutTarget): { path: string; body: unknown } {
  switch (target.kind) {
    case "tier":
      if (!UUID.test(target.eventId)) throw new Error("Not an event id");
      return { path: `/events/${target.eventId}/payments`, body: { tier: target.tier } };
    case "subscription":
      return { path: "/billing/subscription/checkout", body: { plan: target.plan, months: target.months } };
    case "pack":
      return { path: "/billing/pack/checkout", body: { months: target.months } };
    case "packExtra":
      return { path: "/billing/pack/extra/checkout", body: { blocks: target.blocks } };
    case "ownNumber":
      return { path: "/billing/whatsapp-number/checkout", body: { months: target.months } };
  }
}

/**
 * Starts an online payment with the platform's provider and returns the page to
 * send the payer to. Nothing is granted here: the provider confirms the payment
 * to the backend, and the return page reads the outcome.
 */
export async function checkoutAction(target: CheckoutTarget): Promise<ActionResult<string>> {
  const { path, body } = checkoutRequest(target);
  const response = await serverFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const t = await getTranslations("billing.online.errors");
  if (!response.ok) {
    if (response.status >= 500) reportApiError(response);
    if (response.status === 401 || response.status === 403) return fail(t("forbidden"));
    if (response.status === 400) return fail(t("unavailable"));
    if (response.status === 409) return fail(t("conflict"));
    if (response.status === 502) return fail(t("provider"));
    return fail(t("failed"));
  }
  const started = (await response.json()) as PaymentInitiationResult;
  const url = started.instruction.type === "REDIRECT" ? safeUrl(started.instruction.value) : null;
  if (!url) return fail(t("failed"));
  return ok(url);
}

/** Only a web page is ever handed to the browser as a redirect. */
function safeUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Where one of the organization's payments stands; null when it is not theirs or does not exist. */
export async function fetchPaymentStatusAction(paymentId: string): Promise<PaymentStatusView | null> {
  if (!UUID.test(paymentId)) return null;
  const response = await serverFetch(`/billing/payments/${paymentId}`);
  if (!response.ok) {
    if (response.status >= 500) reportApiError(response);
    return null;
  }
  return (await response.json()) as PaymentStatusView;
}
