"use server";

import { serverFetch } from "@/lib/api-server";
import { type ActionResult, fail, ok, reportApiError } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants";
import { getTranslations } from "next-intl/server";
import type { Messages } from "@/i18n/messages";
import { MARKETING_CONSENT_VERSION } from "@/components/modules/identity/schema";
import type {
  BrandingResponse,
  CompleteEmbeddedSignupRequest,
  PaymentMethodsInfo,
  PaymentMethodsInput,
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

// ─── Account ────────────────────────────────────────────────────────────────

/** Gives or withdraws consent to Jikū's news and tips (JIKU-201). */
export async function updateMarketingConsentAction(granted: boolean): Promise<ActionResult> {
  const response = await serverFetch("/auth/me/marketing-consent", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ granted, textVersion: MARKETING_CONSENT_VERSION }),
  });
  if (!response.ok) {
    reportApiError(response);
    const t = await getTranslations("settings.account.news");
    return fail(t("failed"));
  }
  revalidatePath("/settings");
  return ok(null);
}

type SettingsErrorKey = keyof Messages["settings"]["errors"];

async function settingsError(key: SettingsErrorKey): Promise<string> {
  return (await getTranslations("settings.errors"))(key);
}

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
    return fail(await settingsError("branding"));
  }
  return ok(null);
}

/** Which of the organization's photos an upload replaces. */
export type BrandImageKind = "logo" | "banner";

/** Uploads the logo or the banner (JIKU-259); the form carries one `file`, already resized in the browser. */
export async function uploadBrandImageAction(
  kind: BrandImageKind,
  form: FormData,
): Promise<ActionResult<BrandingResponse>> {
  const t = await getTranslations("settings.branding.errors");
  if (!(form.get("file") instanceof Blob)) return fail(t("photoInvalid"));
  const response = await serverFetch(`/branding/${kind}`, { method: "PUT", body: form });
  if (response.ok) {
    revalidatePath(ROUTES.SETTINGS);
    return ok((await response.json()) as BrandingResponse);
  }
  switch (response.status) {
    case 400:
      return fail(t("photoInvalid"));
    case 413:
      return fail(t("photoTooLarge"));
    case 415:
      return fail(t("photoType"));
    default:
      reportApiError(response);
      return fail(await settingsError("branding"));
  }
}

/** Takes the logo or the banner off: guests see the organization's initial or a color band again. */
export async function removeBrandImageAction(kind: BrandImageKind): Promise<ActionResult<BrandingResponse>> {
  const response = await serverFetch(`/branding/${kind}`, { method: "DELETE" });
  if (!response.ok) {
    reportApiError(response);
    return fail(await settingsError("branding"));
  }
  revalidatePath(ROUTES.SETTINGS);
  return ok((await response.json()) as BrandingResponse);
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
    return fail(await settingsError("emailProvider"));
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
  return whatsAppResult(response);
}

/** Finishes Meta's Embedded Signup with what its window handed back (ADR 105). */
export async function completeEmbeddedSignupAction(
  input: CompleteEmbeddedSignupRequest,
): Promise<ActionResult<ProviderSettingsResponse>> {
  const response = await serverFetch("/settings/providers/whatsapp/embedded-signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return whatsAppResult(response);
}

async function whatsAppResult(response: Response): Promise<ActionResult<ProviderSettingsResponse>> {
  const t = await getTranslations("settings.whatsappNumber.errors");
  if (response.status === 409) return fail(t("taken"));
  if (response.status === 502) return fail(t("metaRefused"));
  if (response.status === 503) return fail(t("unavailable"));
  if (!response.ok) {
    reportApiError(response);
    return fail(t("failed"));
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
    return fail(await settingsError("removeProvider"));
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
    return fail(await settingsError("testSend"));
  }
  return ok((await response.json()) as TestSendResponse);
}

// ─── Payment methods (JIKU-109) ─────────────────────────────────────────────

export async function updatePaymentMethodsAction(
  input: PaymentMethodsInput,
): Promise<ActionResult<PaymentMethodsInfo>> {
  const response = await serverFetch("/settings/payment-methods", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (response.status === 403) {
    return fail((await getTranslations("settings.paymentMethods.errors"))("verifyFirst"));
  }
  if (!response.ok) {
    reportApiError(response);
    return fail((await getTranslations("settings.paymentMethods.errors"))("failed"));
  }
  return ok((await response.json()) as PaymentMethodsInfo);
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
    return fail(await settingsError("legalCountry"));
  }
  if (!response.ok) {
    reportApiError(response);
    return fail(await settingsError("legal"));
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
    return fail(await settingsError("terms"));
  }
  return ok(null);
}

export async function fetchTemplateAction(
  name: string,
): Promise<ActionResult<TemplateDetail>> {
  const response = await serverFetch(`/settings/templates/${encodeURIComponent(name)}`);
  if (!response.ok) {
    reportApiError(response);
    return fail(await settingsError("templateLoad"));
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
    return fail(await settingsError("templateSave"));
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
    return fail(await settingsError("templatePreview"));
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
      return fail(await settingsError("usernameTaken"));
    }
    if (response.status === 400) {
      return fail(await settingsError("usernameInvalid"));
    }
    reportApiError(response);
    return fail(await settingsError("username"));
  }
  revalidatePath("/", "layout");
  return ok(null);
}
