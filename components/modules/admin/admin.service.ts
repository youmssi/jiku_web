"use server";

import { getTranslations } from "next-intl/server";
import { localeRedirect } from "@/i18n/redirect";
import { revalidatePath } from "next/cache";
import { type ActionResult, fail, failWithReason, ok, problemCode, reportApiError } from "@/lib/action-result";
import { adminFetch, publicFetch } from "@/lib/api-server";
import { clearAdminAuthCookie, setAdminAuthCookie } from "@/lib/auth";
import {
  clearChallenge,
  enrollmentFrom,
  holdAdminSession,
  readChallenge,
  rememberDevice,
  setChallenge,
  takeAdminSession,
  trustedDeviceToken,
} from "@/lib/two-step";
import type { TwoStepEnrollment, TwoStepInput } from "@/components/shared/two-step";
import { ADMIN_ROUTES } from "@/lib/constants";
import type {
  VerificationDocumentLink,
  TenantDirectoryEntry,
  TenantDirectoryPage,
  AdminBillingSettingsFormValues,
  AdminEventSummary,
} from "@/components/modules/admin/schema";

/** A desk sign-in that needs the code next, or the authentication app set up first (JIKU-317). */
export type AdminSignInStep = { step: "code" } | { step: "setup"; enrollment: TwoStepEnrollment };

export async function adminLoginAction(
  email: string,
  password: string,
): Promise<ActionResult<AdminSignInStep>> {
  const response = await publicFetch("/admin/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, trustedDeviceToken: (await trustedDeviceToken("admin")) ?? null }),
  });
  const t = await getTranslations("admin.errors");
  if (response.status === 401) {
    const code = await problemCode(response);
    const body = (await response.json().catch(() => null)) as { challengeToken?: unknown } | null;
    const challengeToken = typeof body?.challengeToken === "string" ? body.challengeToken : null;
    if (challengeToken && code === "auth.mfa-required") {
      await setChallenge("admin", challengeToken);
      return ok({ step: "code" });
    }
    if (challengeToken && code === "auth.mfa-setup-required") {
      await setChallenge("admin", challengeToken);
      return startAdminSetup(challengeToken);
    }
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

async function startAdminSetup(challengeToken: string): Promise<ActionResult<AdminSignInStep>> {
  const t = await getTranslations("common.twoStep");
  const response = await publicFetch("/admin/auth/mfa/setup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challengeToken }),
  });
  const enrollment = response.ok ? await enrollmentFrom(await response.json()) : null;
  if (!enrollment) {
    reportApiError(response, "admin");
    return fail(t("failed"));
  }
  return ok({ step: "setup", enrollment });
}

/** The desk's code step (JIKU-317). A success opens the desk. */
export async function adminVerifyTwoStepAction(input: TwoStepInput): Promise<ActionResult<null>> {
  const t = await getTranslations("common.twoStep");
  const challengeToken = await readChallenge("admin");
  if (!challengeToken) return fail(t("expired"));
  const response = await publicFetch("/admin/auth/mfa/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challengeToken, ...input }),
  });
  if (!response.ok) return twoStepFailure(response, Boolean(input.backupCode));
  const tokens = (await response.json()) as { accessToken: string; trustedDeviceToken?: string | null };
  await clearChallenge("admin");
  await rememberDevice("admin", tokens.trustedDeviceToken);
  await setAdminAuthCookie(tokens.accessToken);
  return localeRedirect(ADMIN_ROUTES.TENANTS);
}

/** Confirms the desk's first setup with a code (JIKU-317); the session opens and the backup codes show once. */
export async function adminConfirmSetupAction(code: string): Promise<ActionResult<{ backupCodes: string[] }>> {
  const t = await getTranslations("common.twoStep");
  const challengeToken = await readChallenge("admin");
  if (!challengeToken) return fail(t("expired"));
  const response = await publicFetch("/admin/auth/mfa/setup/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challengeToken, code }),
  });
  if (!response.ok) return twoStepFailure(response, false);
  const result = (await response.json()) as { accessToken: string; backupCodes: string[] };
  await clearChallenge("admin");
  await holdAdminSession(result.accessToken);
  return ok({ backupCodes: result.backupCodes });
}

/** Opens the desk once the first setup's backup codes have been seen (JIKU-317). */
export async function adminFinishSetupAction(): Promise<ActionResult> {
  const accessToken = await takeAdminSession();
  if (!accessToken) return fail((await getTranslations("common.twoStep"))("expired"));
  await setAdminAuthCookie(accessToken);
  return localeRedirect(ADMIN_ROUTES.TENANTS);
}

async function twoStepFailure(response: Response, backup: boolean): Promise<ActionResult<never>> {
  const t = await getTranslations("common.twoStep");
  if (response.status === 429) return fail(t("tooMany"));
  if (response.status === 401) return fail(t(backup ? "invalidBackup" : "invalid"));
  reportApiError(response, "admin");
  return fail(t("failed"));
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

/** Search-as-you-type tenant lookup for admin forms (gifts, agreements). */
export async function searchTenantsAction(query: string): Promise<TenantDirectoryEntry[]> {
  const params = new URLSearchParams({ query, size: "10" });
  const response = await adminFetch(`/admin/tenants?${params.toString()}`);
  if (!response.ok) {
    return [];
  }
  const page = (await response.json()) as TenantDirectoryPage;
  return page.entries;
}

/** Search-as-you-type event lookup for the gift form, scoped to one organization. */
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

export async function offerGiftAction(input: {
  tenantId: string;
  kind: string;
  guests?: number;
  days?: number;
  plan?: string;
  months?: number;
  eventId?: string;
  message?: string;
  applyNow: boolean;
}): Promise<ActionResult> {
  return adminMutation("/admin/gifts", input);
}

export async function revokeGiftAction(giftId: string, reason: string): Promise<ActionResult> {
  return adminMutation(`/admin/gifts/${giftId}/revoke`, { reason });
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

/** Hides a follow-up for a week once the team has called (JIKU-202). */
export async function markFollowUpDoneAction(tenantId: string, reason: string): Promise<ActionResult> {
  const response = await adminFetch(`/admin/follow-ups/${tenantId}/${reason}/done`, { method: "POST" });
  if (!response.ok) {
    return failWithReason(response, (await getTranslations("admin.errors"))("followUp"));
  }
  revalidatePath(ADMIN_ROUTES.FOLLOW_UPS, "layout");
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
      perGuest: values.perGuest,
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

// ─── Organization verification (JIKU-175) ────────────────────────────────────

export async function approveVerificationAction(id: string): Promise<ActionResult> {
  return adminMutation(`/admin/verifications/${id}/approve`, {});
}

export async function rejectVerificationAction(id: string, reason: string): Promise<ActionResult> {
  return adminMutation(`/admin/verifications/${id}/reject`, { reason });
}

/**
 * Short-lived links to a request's documents, fetched when the reviewer opens
 * them rather than with the queue: each link expires within minutes and every
 * opening is written to the audit log.
 */
export async function verificationDocumentsAction(id: string): Promise<ActionResult<VerificationDocumentLink[]>> {
  const response = await adminFetch(`/admin/verifications/${id}/documents`);
  if (!response.ok) {
    const t = await getTranslations("admin.verifications");
    return failWithReason(response, t(response.status === 503 ? "storageUnavailable" : "documentsFailed"));
  }
  return ok((await response.json()) as VerificationDocumentLink[]);
}
