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
