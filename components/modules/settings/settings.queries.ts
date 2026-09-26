import "server-only";

import { serverFetch } from "@/lib/api-server";
import { reportApiError } from "@/lib/action-result";
import type {
  BrandingResponse,
  EmbeddedSignupConfig,
  PaymentMethodsInfo,
  LegalIdentityResponse,
  ProviderSettingsResponse,
  TemplateSummary,
  VocabularyEntry,
} from "@/components/modules/settings/schema";

/**
 * Reads for the settings screen, for Server Components only: they are never
 * exposed as Server Actions. A section whose read fails opens on its empty
 * state (null here) rather than blocking the others.
 */
async function read<T>(path: string): Promise<T | null> {
  const response = await serverFetch(path);
  if (!response.ok) {
    reportApiError(response, "settings");
    return null;
  }
  return (await response.json()) as T;
}

export async function loadOrgUsername(): Promise<string | null> {
  const profile = await read<{ username?: string | null }>("/orgs/profile");
  return profile?.username ?? null;
}

export function loadBranding(): Promise<BrandingResponse | null> {
  return read("/branding");
}

export function loadProviderSettings(): Promise<ProviderSettingsResponse | null> {
  return read("/settings/providers");
}

export function loadEmbeddedSignupConfig(): Promise<EmbeddedSignupConfig | null> {
  return read("/settings/providers/whatsapp/embedded-signup");
}

export function loadPaymentMethods(): Promise<PaymentMethodsInfo | null> {
  return read("/settings/payment-methods");
}

export function loadLegalIdentity(): Promise<LegalIdentityResponse | null> {
  return read("/legal-identity");
}

export async function loadVocabulary(): Promise<VocabularyEntry[]> {
  return (await read<VocabularyEntry[]>("/settings/vocabulary")) ?? [];
}

export async function loadTemplates(): Promise<TemplateSummary[]> {
  return (await read<TemplateSummary[]>("/settings/templates")) ?? [];
}
