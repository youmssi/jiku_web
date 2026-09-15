import { publicFetch } from "@/lib/api-server";

export interface PublicOrgService {
  serviceId: string;
  name: string;
  shortCode: string;
}

export interface PublicOrgProfile {
  organizationName: string;
  logoUrl: string | null;
  primaryColor: string;
  services: PublicOrgService[];
}

/**
 * Le profil public d'une organisation, résolu par son identifiant public
 * (username). Une organisation introuvable ou suspendue est un 404 — jamais une
 * fuite de données, jamais un état dégradé affiché.
 */
export async function loadPublicOrg(username: string): Promise<PublicOrgProfile | null> {
  const response = await publicFetch(`/public/orgs/${encodeURIComponent(username)}`);
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as PublicOrgProfile;
}
