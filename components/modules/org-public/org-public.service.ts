import { publicFetch } from "@/lib/api-server";
import type { PublicOrgProfile } from "./schema";

/**
 * The public profile of an organization, resolved by its public identifier
 * (username). A missing or suspended organization is a 404 — never a data
 * leak, never a degraded state rendered to the visitor.
 */
export async function fetchPublicOrgProfile(username: string): Promise<PublicOrgProfile | null> {
  const response = await publicFetch(`/public/orgs/${encodeURIComponent(username)}`);
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as PublicOrgProfile;
}
