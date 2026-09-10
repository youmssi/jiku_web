"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminFetch, publicFetch } from "@/lib/api-server";
import { clearAdminAuthCookie, setAdminAuthCookie } from "@/lib/auth";
import { ADMIN_ROUTES } from "@/lib/constants";
import type {
  TenantDirectoryEntry,
  TenantDirectoryPage,
  RefundBookingRequest,
  AdminBookingRefund,
  AdminBillingSettingsView,
  AdminBillingSettingsFormValues,
} from "@/components/modules/admin/schema";

export interface ActionResult {
  error?: string;
}

export async function adminLoginAction(
  email: string,
  password: string,
): Promise<ActionResult> {
  const response = await publicFetch("/admin/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (response.status === 401) {
    return { error: "Invalid email or password." };
  }
  if (!response.ok) {
    return { error: "Sign-in failed. Please try again." };
  }
  const tokens = (await response.json()) as { accessToken: string };
  await setAdminAuthCookie(tokens.accessToken);
  redirect(ADMIN_ROUTES.TENANTS);
}

export async function adminLogoutAction(): Promise<void> {
  await clearAdminAuthCookie();
  redirect(ADMIN_ROUTES.LOGIN);
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
    const fallback =
      response.status === 409
        ? "This action conflicts with the current state."
        : "The action failed. Please try again.";
    const message = await response
      .json()
      .then((payload: { message?: string }) => payload.message)
      .catch(() => undefined);
    return { error: message ?? fallback };
  }
  revalidatePath("/admin", "layout");
  return {};
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

export async function cancelBookingAction(bookingId: string): Promise<ActionResult> {
  return adminMutation(`/admin/bookings/${bookingId}/cancel`, {});
}

export async function refundBookingAction(
  bookingId: string,
  request: RefundBookingRequest,
): Promise<{ ok: true; refund: AdminBookingRefund } | { ok: false; error?: string }> {
  const response = await adminFetch(`/admin/bookings/${bookingId}/refund`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    return { ok: false, error: "Le remboursement n'a pas pu être enregistré." };
  }
  return { ok: true, refund: (await response.json()) as AdminBookingRefund };
}

export async function verifyBookingPaymentAction(declarationId: string): Promise<ActionResult> {
  return adminMutation(`/admin/booking-payments/${declarationId}/verify`, {});
}

export async function rejectBookingPaymentAction(
  declarationId: string,
  reason: string,
): Promise<ActionResult> {
  return adminMutation(`/admin/booking-payments/${declarationId}/reject`, { reason });
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
    const message = await response
      .json()
      .then((payload: { message?: string }) => payload.message)
      .catch(() => "Impossible de mettre à jour le tarif.");
    return { error: message ?? "Impossible de mettre à jour le tarif." };
  }
  revalidatePath("/admin/whatsapp", "layout");
  return {};
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
    const message = await response
      .json()
      .then((payload: { message?: string }) => payload.message)
      .catch(() => "Impossible de modifier la surcharge de contenu.");
    return { error: message ?? "Impossible de modifier la surcharge de contenu." };
  }
  revalidatePath("/admin/whatsapp", "layout");
  return {};
}

export async function markProspectContactedAction(id: string): Promise<ActionResult> {
  const response = await adminFetch(`/admin/prospects/${id}/contacted`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    return {
      error: "Impossible de marquer cette piste comme contactée.",
    };
  }
  revalidatePath("/admin/prospects", "layout");
  return {};
}

/** Déclenche l'exception de test (JIKU-97) ; le 500 attendu porte le requestId. */
export async function triggerDiagnosticsAction(): Promise<
  { requestId?: string; error?: string } & ActionResult
> {
  const response = await adminFetch("/admin/diagnostics/error", { method: "POST" });
  if (response.ok) {
    return { error: "Aucune erreur déclenchée — réponse inattendue." };
  }
  const requestId = response.headers.get("X-Request-Id") ?? undefined;
  return { requestId };
}

/**
 * Réglages de facturation (bénéficiaire + grilles de prix) tels que le bureau
 * admin les voit. Le backend renvoie la configuration d'environnement par
 * défaut tant que rien n'a été enregistré en base.
 */
export async function fetchBillingSettingsAction(): Promise<AdminBillingSettingsView | null> {
  const response = await adminFetch("/admin/billing/settings");
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as AdminBillingSettingsView;
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
      subscriptionPlans: values.subscriptionPlans,
    }),
  });
  if (!response.ok) {
    const message = await response
      .json()
      .then((payload: { message?: string }) => payload.message)
      .catch(() => undefined);
    return { error: message ?? "Les réglages n'ont pas pu être enregistrés." };
  }
  revalidatePath("/admin", "layout");
  return {};
}
