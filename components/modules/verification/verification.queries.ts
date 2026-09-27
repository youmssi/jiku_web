import "server-only";

import { serverFetch } from "@/lib/api-server";
import { reportApiError } from "@/lib/action-result";
import type { VerificationOverview } from "./schema";

/** Where the organization stands; null when the read fails, so the section shows its error state. */
export async function loadVerification(): Promise<VerificationOverview | null> {
  const response = await serverFetch("/settings/verification");
  if (!response.ok) {
    reportApiError(response, "verification");
    return null;
  }
  return (await response.json()) as VerificationOverview;
}
