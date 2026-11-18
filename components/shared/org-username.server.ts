import "server-only";

import { serverFetch } from "@/lib/api-server";
import { reportApiError } from "@/lib/action-result";

/** The organization's public username, which its sale and booking links are built on; null until it picks one. */
export async function loadOrgUsername(): Promise<string | null> {
  const response = await serverFetch("/orgs/profile");
  if (!response.ok) {
    reportApiError(response, "organization");
    return null;
  }
  return ((await response.json()) as { username?: string | null }).username ?? null;
}
