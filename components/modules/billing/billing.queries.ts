import "server-only";
import { serverFetch } from "@/lib/api-server";
import type { BillingStatus } from "@/components/modules/billing/schema";

/**
 * Where the organization stands with what it pays for (JIKU-254), read once
 * per request for the app's billing reminder. Null when it cannot be read, so
 * the shell never fails because of it.
 */
export async function loadBillingStatus(): Promise<BillingStatus | null> {
  const response = await serverFetch("/billing/status");
  return response.ok ? ((await response.json()) as BillingStatus) : null;
}
