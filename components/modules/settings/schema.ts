import type { Schema } from "@/lib/api-contract";

// CONTRACT — types mirroring the branding and provider settings APIs (JIKU-45).

// ─── Branding ────────────────────────────────────────────────────────────────

export interface BrandingResponse {
  displayName: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string;
}

export interface UpdateBrandingRequest {
  displayName: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
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

/**
 * The organization's WhatsApp number (ADR 105). [allowed] says whether its
 * offer includes its own number; saved credentials are used only while it does.
 */
export type WhatsAppProviderView = Schema<"WhatsAppProviderView">;

/** What Meta's Embedded Signup window needs; [enabled] is false until the Meta app is configured. */
export type EmbeddedSignupConfig = Schema<"EmbeddedSignupConfig">;

/** What Meta's window hands back once the organizer approves. */
export interface CompleteEmbeddedSignupRequest {
  code: string;
  wabaId: string;
  phoneNumberId: string;
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
// Aliased from the generated contract rather than restated, so a backend change
// surfaces as a type error here instead of an undefined field at runtime.

export type LegalIdentityResponse = Schema<"LegalIdentityResponse">;
export type UpdateLegalIdentityRequest = Schema<"UpdateLegalIdentityRequest">;

// ─── Personnalisation (JIKU-91) ──────────────────────────────────────────────
// Tenant-overridable product terms and client-facing email/WhatsApp templates,
// each falling back to the platform default.

export interface VocabularyEntry {
  key: string;
  label: string;
  defaultValue: string;
  value: string;
  overridden: boolean;
}

export interface VocabularyUpdateRequest {
  key: string;
  value: string | null;
}

export interface TemplateSummary {
  name: string;
  label: string;
  channels: string[];
}

export interface TemplateVariable {
  name: string;
  label: string;
  sample: string;
  required: boolean;
}

export interface TemplateChannelView {
  channel: string;
  defaultBody: string;
  body: string;
  isOverride: boolean;
  active: boolean;
}

export interface TemplateDetail {
  name: string;
  label: string;
  channels: TemplateChannelView[];
  variables: TemplateVariable[];
}

export interface TemplateUpdateRequest {
  channel: string;
  body: string;
  active?: boolean;
}

export interface TemplatePreviewRequest {
  channel: string;
  body?: string;
}

export interface TemplatePreviewResponse {
  body: string;
}
