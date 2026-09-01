// CONTRACT — types mirroring the branding and provider settings APIs (JIKU-45).

// ─── Branding ────────────────────────────────────────────────────────────────

export interface BrandingResponse {
  displayName: string;
  logoUrl: string | null;
  primaryColor: string;
}

export interface UpdateBrandingRequest {
  displayName: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
}

// ─── Provider settings ──────────────────────────────────────────────────────

export interface EmailProviderView {
  configured: boolean;
  provider: string | null;
  from: string | null;
  fromName: string | null;
  apiKeyMasked: string | null;
}

export interface WhatsAppProviderView {
  configured: boolean;
  provider: string | null;
  phoneNumberId: string | null;
  accessTokenMasked: string | null;
  templateName: string | null;
  templateLanguage: string | null;
}

export interface ProviderSettingsResponse {
  email: EmailProviderView;
  whatsapp: WhatsAppProviderView;
}

export interface UpdateEmailProviderRequest {
  apiKey: string;
  from: string;
  fromName?: string | null;
}

export interface UpdateWhatsAppProviderRequest {
  accessToken: string;
  phoneNumberId: string;
  templateName?: string | null;
  templateLanguage?: string | null;
}

export interface TestSendRequest {
  recipient: string;
}

export interface TestSendResponse {
  delivered: boolean;
  usingTenantProvider: boolean;
  error: string | null;
}

// ─── Legal identity (JIKU-69) ───────────────────────────────────────────────
// The organization's details as they must appear on an invoice a company or
// public-sector buyer can process. Mirrors the backend's LegalIdentityResponse.

export interface LegalIdentityResponse {
  legalName: string | null;
  registrationNumber: string | null;
  taxIdentifier: string | null;
  addressLine: string | null;
  city: string | null;
  country: string | null;
  /** Whether an invoice can be issued; the backend refuses until this is true. */
  completeForInvoicing: boolean;
}

export interface UpdateLegalIdentityRequest {
  legalName: string | null;
  registrationNumber: string | null;
  taxIdentifier: string | null;
  addressLine: string | null;
  city: string | null;
  country: string | null;
}
