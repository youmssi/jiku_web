"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminFetch, publicFetch } from "@/lib/api-server";
import { clearAdminAuthCookie, setAdminAuthCookie } from "@/lib/auth";
import { ADMIN_ROUTES } from "@/lib/constants";
import type { TenantDirectoryEntry, TenantDirectoryPage } from "@/components/modules/admin/schema";

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

export async function verifyBookingPaymentAction(declarationId: string): Promise<ActionResult> {
  return adminMutation(`/admin/booking-payments/${declarationId}/verify`, {});
}

export async function rejectBookingPaymentAction(
  declarationId: string,
  reason: string,
): Promise<ActionResult> {
  return adminMutation(`/admin/booking-payments/${declarationId}/reject`, { reason });
}
