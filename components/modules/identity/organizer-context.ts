import { serverFetch } from "@/lib/api-server";
import type { Branding, CurrentUser, Membership } from "@/components/modules/identity/schema";

/** The signed-in organizer's identity and branding, used to render app chrome. */
export interface OrganizerContext {
  userId: string;
  role: string;
  email: string;
  brandName: string;
  logoUrl: string | null;
  /** All organizations the user belongs to; empty until onboarding (JIKU-48). */
  memberships: Membership[];
  /** The organization the session is bound to; "" for a fresh, org-less account. */
  activeTenantId: string;
}

async function fetchJson<T>(path: string): Promise<T | null> {
  const response = await serverFetch(path);
  return response.ok ? ((await response.json()) as T) : null;
}

/**
 * Loads the current organizer's context for the shell (sidebar, greeting).
 * Returns null when the request is unauthenticated so callers can redirect;
 * callers also bounce sessions with no organization to onboarding.
 */
export async function getOrganizerContext(): Promise<OrganizerContext | null> {
  const me = await fetchJson<CurrentUser>("/auth/me");
  if (!me) {
    return null;
  }
  // Branding needs an organization (and the manager role); fall back quietly.
  const branding = me.tenantId ? await fetchJson<Branding>("/branding") : null;
  const active = me.memberships.find((m) => m.tenantId === me.tenantId);
  return {
    userId: me.userId,
    role: me.role,
    email: me.email,
    brandName: branding?.displayName ?? active?.tenantName ?? "Your organization",
    logoUrl: branding?.logoUrl ?? null,
    memberships: me.memberships,
    activeTenantId: me.tenantId,
  };
}
