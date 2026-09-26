"use server";

import { getTranslations } from "next-intl/server";
import { localeRedirect } from "@/i18n/redirect";
import { revalidatePath } from "next/cache";
import { type ActionResult, fail, failWithReason, ok, reportApiError } from "@/lib/action-result";
import { adminFetch, publicFetch } from "@/lib/api-server";
import { clearAdminAuthCookie, setAdminAuthCookie } from "@/lib/auth";
import { ADMIN_ROUTES } from "@/lib/constants";
import type {
  TenantDirectoryEntry,
  TenantDirectoryPage,
  AdminBillingSettingsFormValues,
  AdminEventSummary,
} from "@/components/modules/admin/schema";

export async function adminLoginAction(
  email: string,
  password: string,
): Promise<ActionResult> {
  const response = await publicFetch("/admin/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const t = await getTranslations("admin.errors");
  if (response.status === 401) {
    return fail(t("invalidCredentials"));
  }
  if (!response.ok) {
    reportApiError(response, "admin");
    return fail(t("signInFailed"));
  }
  const tokens = (await response.json()) as { accessToken: string };
  await setAdminAuthCookie(tokens.accessToken);
  return localeRedirect(ADMIN_ROUTES.TENANTS);
}

export async function adminLogoutAction(): Promise<void> {
  await clearAdminAuthCookie();
  return localeRedirect(ADMIN_ROUTES.LOGIN);
}

/**
 * One helper for every back-office mutation: POST, surface the backend's reason
 * on failure, and refresh the admin pages (data + audit) on success.
 */
async function adminMutation(path: string, body: unknown): Promise<ActionResult> {
  const response = await adminFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const t = await getTranslations("admin.errors");
    return failWithReason(response, response.status === 409 ? t("conflict") : t("failed"));
  }
  revalidatePath("/admin", "layout");
  return ok(null);
}

export async function suspendTenantAction(tenantId: string, note: string): Promise<ActionResult> {
  return adminMutation(`/admin/tenants/${tenantId}/suspend`, { note });
}

export async function reactivateTenantAction(
  tenantId: string,
  note: string,
): Promise<ActionResult> {
  return adminMutation(`/admin/tenants/${tenantId}/reactivate`, { note });
}

export async function confirmPaymentAction(
  paymentId: string,
  transactionReference: string,
): Promise<ActionResult> {
  return adminMutation(`/admin/payments/${paymentId}/confirm`, { transactionReference });
}

export async function rejectPaymentAction(
  paymentId: string,
  reason: string,
): Promise<ActionResult> {
  return adminMutation(`/admin/payments/${paymentId}/reject`, { reason });
}

/** Search-as-you-type tenant lookup for admin forms (Grant Trial, agreements). */
export async function searchTenantsAction(query: string): Promise<TenantDirectoryEntry[]> {
  const params = new URLSearchParams({ query, size: "10" });
  const response = await adminFetch(`/admin/tenants?${params.toString()}`);
  if (!response.ok) {
    return [];
  }
  const page = (await response.json()) as TenantDirectoryPage;
  return page.entries;
}

/** Search-as-you-type event lookup for the trial grant form, scoped to one organization. */
export async function searchTenantEventsAction(
  tenantId: string,
  query: string,
): Promise<AdminEventSummary[]> {
  const params = new URLSearchParams({ query });
  const response = await adminFetch(`/admin/tenants/${tenantId}/events?${params.toString()}`);
  if (!response.ok) {
    return [];
  }
  return (await response.json()) as AdminEventSummary[];
}

export async function grantTrialAction(input: {
  tenantId: string;
  eventId: string;
  tier: string;
  expiresAt: string;
}): Promise<ActionResult> {
  return adminMutation("/admin/trials", input);
}

export async function endTrialAction(trialId: string, reason: string): Promise<ActionResult> {
  return adminMutation(`/admin/trials/${trialId}/end`, { reason });
}

export async function createAgreementAction(input: {
  tenantId: string;
  kind: string;
  periodStart: string;
  periodEnd: string;
  amountMinor: number | null;
  currency: string | null;
  notes: string | null;
}): Promise<ActionResult> {
  return adminMutation("/admin/agreements", input);
}

export async function renewAgreementAction(
  agreementId: string,
  periodEnd: string,
): Promise<ActionResult> {
  return adminMutation(`/admin/agreements/${agreementId}/renew`, { periodEnd });
}

export async function interruptAgreementAction(
  agreementId: string,
  reason: string,
): Promise<ActionResult> {
  return adminMutation(`/admin/agreements/${agreementId}/interrupt`, { reason });
}

export async function updateWhatsAppPricingAction(
  category: string,
  costUsdMinor: number,
): Promise<ActionResult> {
  const response = await adminFetch(`/admin/whatsapp/pricing/${category}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ costUsdMinor }),
  });
  if (!response.ok) {
    return failWithReason(response, (await getTranslations("admin.errors"))("pricing"));
  }
  revalidatePath("/admin/whatsapp", "layout");
  return ok(null);
}

export async function setWhatsAppOverrideAction(
  active: boolean,
  reason: string,
): Promise<ActionResult> {
  const response = await adminFetch("/admin/whatsapp/content-override", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active, reason }),
  });
  if (!response.ok) {
    return failWithReason(response, (await getTranslations("admin.errors"))("override"));
  }
  revalidatePath("/admin/whatsapp", "layout");
  return ok(null);
}

export async function markProspectContactedAction(id: string): Promise<ActionResult> {
  const response = await adminFetch(`/admin/prospects/${id}/contacted`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    return failWithReason(response, (await getTranslations("admin.errors"))("prospect"));
  }
  revalidatePath("/admin/prospects", "layout");
  return ok(null);
}

/**
 * Déclenche l'exception de test (JIKU-97). Le succès, c'est le 500 attendu : il
 * porte le requestId à retrouver dans le suivi d'erreurs.
 */
export async function triggerDiagnosticsAction(): Promise<ActionResult<{ requestId: string | null }>> {
  const response = await adminFetch("/admin/diagnostics/error", { method: "POST" });
  if (response.ok) {
    return fail((await getTranslations("admin.errors"))("diagnostics"));
  }
  return ok({ requestId: response.headers.get("X-Request-Id") });
}

export async function updateBillingSettingsAction(
  values: AdminBillingSettingsFormValues,
): Promise<ActionResult> {
  const response = await adminFetch("/admin/billing/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      payee: {
        payeeName: values.payee.payeeName.trim() || null,
        contactEmail: values.payee.contactEmail.trim() || null,
        contactPhone: values.payee.contactPhone.trim() || null,
        mobileMoneyNumber: values.payee.mobileMoneyNumber.trim() || null,
        mobileMoneyOperator: values.payee.mobileMoneyOperator.trim() || null,
        bankDetails: values.payee.bankDetails.trim() || null,
      },
      tiers: values.tiers,
      subscriptionPlans: values.subscriptionPlans.map((plan) => ({
        name: plan.name,
        includedPeople: plan.includedPeople,
        maxPeople: plan.maxPeople ? Number(plan.maxPeople) : null,
        monthly: plan.monthly,
        extraPerson: Object.values(plan.extraPerson).some((value) => value > 0) ? plan.extraPerson : null,
      })),
    }),
  });
  if (!response.ok) {
    return failWithReason(response, (await getTranslations("admin.errors"))("billingSettings"));
  }
  revalidatePath("/admin", "layout");
  return ok(null);
}

/** Moves a feedback message along the desk's triage, with an optional note. */
export async function updateFeedbackStatusAction(id: string, status: string, note: string): Promise<ActionResult> {
  return adminMutation(`/admin/feedback/${id}/status`, { status, note: note || null });
}
