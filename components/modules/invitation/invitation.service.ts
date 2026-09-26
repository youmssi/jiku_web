"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { publicFetch } from "@/lib/api-server";
import { invitationRoute } from "@/lib/constants";
import { type ActionResult, fail, ok, reportApiError } from "@/lib/action-result";
import {
  transferTicketSchema,
  type TransferTicketInput,
} from "@/components/modules/invitation/schema";

async function submit(token: string, action: "confirm" | "decline"): Promise<ActionResult> {
  const response = await publicFetch(`/rsvp/${token}/${action}`, { method: "POST" });
  if (!response.ok) {
    reportApiError(response);
    const t = await getTranslations("guest.rsvp");
    return fail(response.status === 409 ? t("full") : t("failed"));
  }
  revalidatePath(invitationRoute(token));
  return ok(null);
}

export async function confirmRsvpAction(token: string): Promise<ActionResult> {
  return submit(token, "confirm");
}

export async function declineRsvpAction(token: string): Promise<ActionResult> {
  return submit(token, "decline");
}

/**
 * Hands this guest's place to someone else (JIKU-64). The backend re-checks every
 * condition the UI used to decide whether to offer the control, so a 409 here is
 * a genuine state change (transfers closed, deadline passed, already scanned in)
 * rather than a client bug — surface its reason rather than a generic failure.
 */
export async function transferTicketAction(
  token: string,
  input: TransferTicketInput,
): Promise<ActionResult> {
  const t = await getTranslations("guest.transfer");
  const parsed = transferTicketSchema.safeParse(input);
  if (!parsed.success) {
    return fail(t("invalid"));
  }
  const response = await publicFetch(`/rsvp/${token}/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email || null,
      phoneNumber: parsed.data.phoneNumber || null,
    }),
  });
  if (!response.ok) {
    reportApiError(response);
    if (response.status === 409) {
      return fail(t("closed"));
    }
    if (response.status === 400) {
      return fail(t("contactRequired"));
    }
    return fail((await getTranslations("guest.rsvp"))("failed"));
  }
  revalidatePath(invitationRoute(token));
  return ok(null);
}

export async function requestErasureAction(token: string): Promise<ActionResult> {
  const response = await publicFetch(`/rsvp/${token}/erase`, { method: "POST" });
  if (!response.ok) {
    reportApiError(response);
    return fail((await getTranslations("guest.erasure"))("failed"));
  }
  revalidatePath(invitationRoute(token));
  return ok(null);
}
