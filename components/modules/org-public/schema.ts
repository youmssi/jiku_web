// CONTRACT — mirrors the backend's public org profile response (GET /public/orgs/{username}).

export interface PublicOrgService {
  serviceId: string;
  name: string;
  shortCode: string;
}

export interface PublicOrgProfile {
  organizationName: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string;
  services: PublicOrgService[];
}
