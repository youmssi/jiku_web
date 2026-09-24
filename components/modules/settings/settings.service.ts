"use server";

import { serverFetch } from "@/lib/api-server";
import { type ActionResult, fail, ok, reportApiError } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import type {
  ProviderSettingsResponse,
  UpdateBrandingRequest,
  UpdateEmailProviderRequest,
  UpdateWhatsAppProviderRequest,
  TestSendResponse,
  LegalIdentityResponse,
  UpdateLegalIdentityRequest,
  VocabularyUpdateRequest,
  TemplateDetail,
  TemplatePreviewRequest,
  TemplatePreviewResponse,
  TemplateUpdateRequest,
} from "./schema";

// ─── Branding ───────────────────────────────────────────────────────────────

export async function updateBrandingAction(
  input: UpdateBrandingRequest,
): Promise<ActionResult> {
  const response = await serverFetch("/branding", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    reportApiError(response);
    return fail("We couldn't save your branding. Please try again.");
  }
  return ok(null);
}

// ─── Provider settings ──────────────────────────────────────────────────────

export async function updateEmailProviderAction(
  input: UpdateEmailProviderRequest,
): Promise<ActionResult<ProviderSettingsResponse>> {
  const response = await serverFetch("/settings/providers/email", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    reportApiError(response);
    return fail("We couldn't save your email settings. Please try again.");
  }
  return ok((await response.json()) as ProviderSettingsResponse);
}

export async function updateWhatsAppProviderAction(
  input: UpdateWhatsAppProviderRequest,
): Promise<ActionResult<ProviderSettingsResponse>> {
  const response = await serverFetch("/settings/providers/whatsapp", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    reportApiError(response);
    return fail("We couldn't save your WhatsApp settings. Please try again.");
  }
  return ok((await response.json()) as ProviderSettingsResponse);
}

export async function removeProviderAction(
  channel: string,
): Promise<ActionResult<ProviderSettingsResponse>> {
  const response = await serverFetch(`/settings/providers/${channel}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    reportApiError(response);
    return fail("We couldn't remove the provider configuration.");
  }
  return ok((await response.json()) as ProviderSettingsResponse);
}

export async function testSendAction(
  channel: string,
  recipient: string,
): Promise<ActionResult<TestSendResponse>> {
  const response = await serverFetch(`/settings/providers/${channel}/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient }),
  });
  if (!response.ok) {
    return fail("The test message could not be sent.");
  }
  return ok((await response.json()) as TestSendResponse);
}

// ─── Legal identity (JIKU-69) ───────────────────────────────────────────────

export async function updateLegalIdentityAction(
  input: UpdateLegalIdentityRequest,
): Promise<ActionResult<LegalIdentityResponse>> {
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
  return ok((await response.json()) as LegalIdentityResponse);
}

// ─── Personnalisation (JIKU-91) ──────────────────────────────────────────────

export async function updateVocabularyAction(
  updates: VocabularyUpdateRequest[],
): Promise<ActionResult> {
  const response = await serverFetch("/settings/vocabulary", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    reportApiError(response);
    return fail("We couldn't save the terms. Please try again.");
  }
  return ok(null);
}

export async function fetchTemplateAction(
  name: string,
): Promise<ActionResult<TemplateDetail>> {
  const response = await serverFetch(`/settings/templates/${encodeURIComponent(name)}`);
  if (!response.ok) {
    reportApiError(response);
    return fail("We couldn't load this template.");
  }
  return ok((await response.json()) as TemplateDetail);
}

export async function saveTemplateAction(
  name: string,
  update: TemplateUpdateRequest,
): Promise<ActionResult<TemplateDetail>> {
  const response = await serverFetch(`/settings/templates/${encodeURIComponent(name)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
  if (!response.ok) {
    reportApiError(response);
    return fail("We couldn't save this template.");
  }
  return ok((await response.json()) as TemplateDetail);
}

export async function previewTemplateAction(
  name: string,
  request: TemplatePreviewRequest,
): Promise<ActionResult<TemplatePreviewResponse>> {
  const response = await serverFetch(`/settings/templates/${encodeURIComponent(name)}/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    reportApiError(response);
    return fail("We couldn't preview this template.");
  }
  return ok((await response.json()) as TemplatePreviewResponse);
}

// ─── Profil public de l'organisation ────────────────────────────────────────

/**
 * Lie (ou change) l'identifiant public de l'organisation, celui de sa page
 * découverte à /o/{username}. Réservé aux admins et au propriétaire.
 */
export async function updateOrgUsernameAction(
  username: string,
): Promise<ActionResult> {
  const response = await serverFetch("/orgs/username", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  if (!response.ok) {
    if (response.status === 409) {
      return fail("This username is already taken. Pick another.");
    }
    if (response.status === 400) {
      return fail("Use 3 to 32 lowercase letters, numbers and hyphens.");
    }
    reportApiError(response);
    return fail("We couldn't save the username. Please try again.");
  }
  revalidatePath("/", "layout");
  return ok(null);
}
