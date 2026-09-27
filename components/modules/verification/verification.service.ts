"use server";

import { getTranslations } from "next-intl/server";
import { serverFetch } from "@/lib/api-server";
import { type ActionResult, fail, ok, reportApiError } from "@/lib/action-result";
import {
  codeSchema,
  phoneSchema,
  type CodeInput,
  type PhoneInput,
  type PhoneStatus,
  type VerificationKind,
  type VerificationRequest,
} from "./schema";

const KINDS: readonly VerificationKind[] = ["personal", "company"];

function errors() {
  return getTranslations("settings.verification.errors");
}

/** Sends a six-digit code by SMS to the number the organization will be reached on. */
export async function requestPhoneCodeAction(input: PhoneInput): Promise<ActionResult<{ expiresAt: string }>> {
  const t = await errors();
  const parsed = phoneSchema.safeParse(input);
  if (!parsed.success) return fail(t("phoneInvalid"));
  const response = await serverFetch("/settings/verification/phone", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  if (response.ok) return ok((await response.json()) as { expiresAt: string });
  if (response.status === 400) return fail(t("phoneInvalid"));
  if (response.status === 429) return fail(t("tooManyCodes"));
  reportApiError(response);
  return fail(t("codeNotSent"));
}

export async function confirmPhoneAction(input: CodeInput): Promise<ActionResult<PhoneStatus>> {
  const t = await errors();
  const parsed = codeSchema.safeParse(input);
  if (!parsed.success) return fail(t("wrongCode"));
  const response = await serverFetch("/settings/verification/phone/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  if (response.ok) return ok((await response.json()) as PhoneStatus);
  if (response.status === 400) return fail(t("wrongCode"));
  if (response.status === 409) return fail(t("requestCodeFirst"));
  if (response.status === 410) return fail(t("codeExpired"));
  reportApiError(response);
  return fail(t("failed"));
}

/**
 * Submits a personal or company request with its documents. The form data is
 * forwarded as is: the backend checks each file by its content and size, and
 * says which rule a refused request broke.
 */
export async function submitVerificationAction(
  kind: VerificationKind,
  form: FormData,
): Promise<ActionResult<VerificationRequest>> {
  const t = await errors();
  if (!KINDS.includes(kind) || form.getAll("files").length === 0) return fail(t("failed"));
  const response = await serverFetch(`/settings/verification/${kind}`, { method: "POST", body: form });
  if (response.ok) return ok((await response.json()) as VerificationRequest);
  switch (response.status) {
    case 400:
      return fail(t("incomplete"));
    case 409:
      return fail(t(kind === "personal" ? "phoneFirstOrPending" : "alreadyPending"));
    case 413:
      return fail(t("fileTooLarge"));
    case 415:
      return fail(t("fileType"));
    case 503:
      reportApiError(response);
      return fail(t("storageUnavailable"));
    default:
      reportApiError(response);
      return fail(t("failed"));
  }
}
