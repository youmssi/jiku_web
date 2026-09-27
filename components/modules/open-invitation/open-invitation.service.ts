"use server";

import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { publicFetch, serverFetch } from "@/lib/api-server";
import { eventOpenInvitationRoute } from "@/lib/constants";
import { type ActionResult, fail, ok, reportApiError } from "@/lib/action-result";
import { respondSchema, type OpenResponse, type RespondInput, type SettingsInput } from "./schema";

/**
 * Records a person's answer to a shared card; answering again from the same
 * number changes the answer. A "yes" comes back with the ticket's link token.
 */
export async function respondAction(code: string, input: RespondInput): Promise<ActionResult<OpenResponse>> {
  const t = await getTranslations("guest.openInvitation.errors");
  const parsed = respondSchema.safeParse(input);
  if (!parsed.success) return fail(t("invalid"));
  const response = await publicFetch(`/open/${encodeURIComponent(code)}/responses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  if (response.ok) return ok((await response.json()) as OpenResponse);
  switch (response.status) {
    case 400:
      return fail(t("invalid"));
    case 402:
      return fail(t("limit"));
    case 403:
      return fail(t("removed"));
    case 404:
      return fail(t("notFound"));
    case 409:
      return fail(t("closed"));
    case 429:
      return fail(t("tooMany"));
    default:
      reportApiError(response, "open-invitation");
      return fail(t("failed"));
  }
}

/** Opens the event's open invitation the first time, then saves its settings. */
export async function saveOpenInvitationAction(eventId: string, input: SettingsInput): Promise<ActionResult> {
  const t = await getTranslations("events.openInvitation.errors");
  const closesAt = input.closesAt ? new Date(input.closesAt) : null;
  if (closesAt && Number.isNaN(closesAt.getTime())) return fail(t("invalid"));
  const response = await serverFetch(`/events/${encodeURIComponent(eventId)}/open-invitation`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      enabled: input.enabled,
      welcomeMessage: input.welcomeMessage.trim() || null,
      maxCompanions: input.maxCompanions,
      closesAt: closesAt?.toISOString() ?? null,
    }),
  });
  if (!response.ok) {
    if (response.status === 400) return fail(t("invalid"));
    reportApiError(response, "open-invitation");
    return fail(t("saveFailed"));
  }
  revalidatePath(eventOpenInvitationRoute(eventId));
  return ok(null);
}

/** Opens the event's open invitation with the platform's default settings. */
export async function openInvitationAction(eventId: string): Promise<ActionResult> {
  const t = await getTranslations("events.openInvitation.errors");
  const response = await serverFetch(`/events/${encodeURIComponent(eventId)}/open-invitation`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!response.ok) {
    reportApiError(response, "open-invitation");
    return fail(t("saveFailed"));
  }
  revalidatePath(eventOpenInvitationRoute(eventId));
  return ok(null);
}

/** Takes a person off the list: their places come back and their number can no longer answer. */
export async function removeOpenResponseAction(eventId: string, responseId: string): Promise<ActionResult> {
  const t = await getTranslations("events.openInvitation.errors");
  const response = await serverFetch(
    `/events/${encodeURIComponent(eventId)}/open-invitation/responses/${encodeURIComponent(responseId)}`,
    { method: "DELETE" },
  );
  if (!response.ok) {
    reportApiError(response, "open-invitation");
    return fail(t("removeFailed"));
  }
  revalidatePath(eventOpenInvitationRoute(eventId));
  return ok(null);
}
