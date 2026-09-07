"use server";

import { serverFetch } from "@/lib/api-server";
import { fail, reportApiError } from "@/lib/action-result";
import type {
  BrandingResponse,
  ProviderSettingsResponse,
  UpdateBrandingRequest,
  UpdateEmailProviderRequest,
  UpdateWhatsAppProviderRequest,
  TestSendResponse,
  LegalIdentityResponse,
  UpdateLegalIdentityRequest,
  VocabularyEntry,
  VocabularyUpdateRequest,
  TemplateDetail,
  TemplateSummary,
  TemplatePreviewRequest,
  TemplatePreviewResponse,
  TemplateUpdateRequest,
} from "./schema";

// ─── Branding ───────────────────────────────────────────────────────────────

export async function fetchBrandingAction(): Promise<
  { ok: true; data: BrandingResponse } | { ok: false }
> {
  const response = await serverFetch("/branding");
  if (!response.ok) return { ok: false };
  return { ok: true, data: (await response.json()) as BrandingResponse };
}

export async function updateBrandingAction(
  input: UpdateBrandingRequest,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const response = await serverFetch("/branding", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    reportApiError(response);
    return fail("We couldn't save your branding. Please try again.");
  }
  return { ok: true };
}

// ─── Provider settings ──────────────────────────────────────────────────────

export async function fetchProviderSettingsAction(): Promise<
  { ok: true; data: ProviderSettingsResponse } | { ok: false }
> {
  const response = await serverFetch("/settings/providers");
  if (!response.ok) return { ok: false };
  return {
    ok: true,
    data: (await response.json()) as ProviderSettingsResponse,
  };
}

export async function updateEmailProviderAction(
  input: UpdateEmailProviderRequest,
): Promise<
  { ok: true; data: ProviderSettingsResponse } | { ok: false; error: string }
> {
  const response = await serverFetch("/settings/providers/email", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    reportApiError(response);
    return fail("We couldn't save your email settings. Please try again.");
  }
  return { ok: true, data: (await response.json()) as ProviderSettingsResponse };
}

export async function updateWhatsAppProviderAction(
  input: UpdateWhatsAppProviderRequest,
): Promise<
  { ok: true; data: ProviderSettingsResponse } | { ok: false; error: string }
> {
  const response = await serverFetch("/settings/providers/whatsapp", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    reportApiError(response);
    return fail("We couldn't save your WhatsApp settings. Please try again.");
  }
  return { ok: true, data: (await response.json()) as ProviderSettingsResponse };
}

export async function removeProviderAction(
  channel: string,
): Promise<
  { ok: true; data: ProviderSettingsResponse } | { ok: false; error: string }
> {
  const response = await serverFetch(`/settings/providers/${channel}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    reportApiError(response);
    return fail("We couldn't remove the provider configuration.");
  }
  return { ok: true, data: (await response.json()) as ProviderSettingsResponse };
}

export async function testSendAction(
  channel: string,
  recipient: string,
): Promise<{ ok: true; data: TestSendResponse } | { ok: false; error: string }> {
  const response = await serverFetch(`/settings/providers/${channel}/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient }),
  });
  if (!response.ok) {
    return { ok: false, error: "The test message could not be sent." };
  }
  return { ok: true, data: (await response.json()) as TestSendResponse };
}

// ─── Legal identity (JIKU-69) ───────────────────────────────────────────────

export async function fetchLegalIdentityAction(): Promise<
  { ok: true; data: LegalIdentityResponse } | { ok: false }
> {
  const response = await serverFetch("/legal-identity");
  if (!response.ok) return { ok: false };
  return { ok: true, data: (await response.json()) as LegalIdentityResponse };
}

export async function updateLegalIdentityAction(
  input: UpdateLegalIdentityRequest,
): Promise<{ ok: true; data: LegalIdentityResponse } | { ok: false; error: string }> {
  const response = await serverFetch("/legal-identity", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (response.status === 400) {
    return fail("Check the details — the country must be a two-letter code such as GN.");
  }
  if (!response.ok) {
    reportApiError(response);
    return fail("We couldn't save your legal details. Please try again.");
  }
  return { ok: true, data: (await response.json()) as LegalIdentityResponse };
}

// ─── Personnalisation (JIKU-91) ──────────────────────────────────────────────

export async function fetchVocabularyAction(): Promise<VocabularyEntry[]> {
  const response = await serverFetch("/settings/vocabulary");
  if (!response.ok) return [];
  return (await response.json()) as VocabularyEntry[];
}

export async function updateVocabularyAction(
  updates: VocabularyUpdateRequest[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const response = await serverFetch("/settings/vocabulary", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    reportApiError(response);
    return fail("We couldn't save the terms. Please try again.");
  }
  return { ok: true };
}

export async function fetchTemplatesAction(): Promise<TemplateSummary[]> {
  const response = await serverFetch("/settings/templates");
  if (!response.ok) return [];
  return (await response.json()) as TemplateSummary[];
}

export async function fetchTemplateAction(
  name: string,
): Promise<{ ok: true; data: TemplateDetail } | { ok: false; error: string }> {
  const response = await serverFetch(`/settings/templates/${encodeURIComponent(name)}`);
  if (!response.ok) {
    reportApiError(response);
    return fail("We couldn't load this template.");
  }
  return { ok: true, data: (await response.json()) as TemplateDetail };
}

export async function saveTemplateAction(
  name: string,
  update: TemplateUpdateRequest,
): Promise<{ ok: true; data: TemplateDetail } | { ok: false; error: string }> {
  const response = await serverFetch(`/settings/templates/${encodeURIComponent(name)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
  if (!response.ok) {
    reportApiError(response);
    return fail("We couldn't save this template.");
  }
  return { ok: true, data: (await response.json()) as TemplateDetail };
}

export async function previewTemplateAction(
  name: string,
  request: TemplatePreviewRequest,
): Promise<{ ok: true; data: TemplatePreviewResponse } | { ok: false; error: string }> {
  const response = await serverFetch(`/settings/templates/${encodeURIComponent(name)}/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    reportApiError(response);
    return fail("We couldn't preview this template.");
  }
  return { ok: true, data: (await response.json()) as TemplatePreviewResponse };
}
