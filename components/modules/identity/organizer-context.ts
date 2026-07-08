import { serverFetch } from "@/lib/api-server";
import type { Branding, CurrentUser } from "@/components/modules/identity/schema";

/** The signed-in organizer's identity and branding, used to render app chrome. */
export interface OrganizerContext {
  role: string;
  brandName: string;
  logoUrl: string | null;
}

async function fetchJson<T>(path: string): Promise<T | null> {
  const response = await serverFetch(path);
  return response.ok ? ((await response.json()) as T) : null;
}

/**
 * Loads the current organizer's context for the shell (sidebar, greeting).
 * Returns null when the request is unauthenticated so callers can redirect.
 */
export async function getOrganizerContext(): Promise<OrganizerContext | null> {
  const me = await fetchJson<CurrentUser>("/auth/me");
  if (!me) {
    return null;
  }
  const branding = await fetchJson<Branding>("/branding");
  return {
    role: me.role,
    brandName: branding?.displayName ?? "Your organization",
    logoUrl: branding?.logoUrl ?? null,
  };
}
