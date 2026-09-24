"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { serverFetch } from "@/lib/api-server";
import { eventGuestsRoute } from "@/lib/constants";
import { type ActionResult, fail, fromResponse, ok, reportApiError } from "@/lib/action-result";
import {
  PAYMENT_METHODS,
  singleGuestSchema,
  type Guest,
  type ImportResult,
  type PaymentMethod,
  type SingleGuestInput,
} from "@/components/modules/guest/schema";

function errors() {
  return getTranslations("guests.errors");
}

/** A CSV cell, quoted when the value itself holds a separator, a quote or a line break. */
function csvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

async function uploadCsv(eventId: string, body: FormData, failure: string): Promise<ActionResult<ImportResult>> {
  const t = await errors();
  const response = await serverFetch(`/events/${eventId}/guests/import`, { method: "POST", body });
  const result = await fromResponse<ImportResult>(response, {
    400: t("missingColumns"),
    default: failure,
  });
  if (result.ok) {
    revalidatePath(eventGuestsRoute(eventId));
  }
  return result;
}

export async function importGuestsAction(
  eventId: string,
  formData: FormData,
): Promise<ActionResult<ImportResult>> {
  const t = await errors();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return fail(t("noFile"));
  }
  const body = new FormData();
  body.append("file", file);
  return uploadCsv(eventId, body, t("importFailed"));
}

/** One guest added by hand, sent through the same import pipeline as a one-row file. */
export async function addGuestAction(
  eventId: string,
  data: SingleGuestInput,
): Promise<ActionResult<ImportResult>> {
  const t = await errors();
  const parsed = singleGuestSchema.safeParse(data);
  if (!parsed.success) {
    return fail(t("invalid"));
  }
  const { firstName, lastName, email, phone } = parsed.data;
  const csv = ["firstName,lastName,email,phone", [firstName, lastName, email, phone].map(csvCell).join(",")].join("\n");
  const body = new FormData();
  body.append("file", new Blob([csv], { type: "text/csv" }), "guest.csv");
  return uploadCsv(eventId, body, t("addFailed"));
}

export async function removeGuestAction(eventId: string, guestId: string): Promise<ActionResult<null>> {
  const t = await errors();
  const response = await serverFetch(`/events/${eventId}/guests/${guestId}`, { method: "DELETE" });
  if (response.ok) {
    revalidatePath(eventGuestsRoute(eventId));
    return ok(null);
  }
  if (response.status === 409) {
    return fail(t("alreadyInvited"));
  }
  reportApiError(response);
  return fail(t("removeFailed"));
}

export async function setGuestExclusionAction(
  eventId: string,
  guestId: string,
  excluded: boolean,
): Promise<ActionResult<Guest>> {
  const t = await errors();
  const response = await serverFetch(`/events/${eventId}/guests/${guestId}/exclusion`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ excluded }),
  });
  const result = await fromResponse<Guest>(response, { default: t("exclusionFailed") });
  if (result.ok) {
    revalidatePath(eventGuestsRoute(eventId));
  }
  return result;
}

/**
 * Records that a guest paid the organizer for their ticket (JIKU-110), through
 * the same endpoint the door uses. A 409 means nothing was owed any more:
 * someone at the door confirmed it first.
 */
export async function markGuestPaidAction(
  eventId: string,
  ticketCode: string,
  method: PaymentMethod,
): Promise<ActionResult<null>> {
  const t = await errors();
  if (!PAYMENT_METHODS.includes(method)) {
    return fail(t("invalid"));
  }
  const response = await serverFetch(
    `/events/${eventId}/checkin/tickets/${encodeURIComponent(ticketCode)}/paid`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method }),
    },
  );
  if (response.ok || response.status === 409) {
    revalidatePath(eventGuestsRoute(eventId));
    return response.ok ? ok(null) : fail(t("alreadyPaid"));
  }
  reportApiError(response);
  return fail(t("markPaidFailed"));
}

export interface SendInvitationsFailure {
  ok: false;
  error: string;
  /** True when the failure is the guest-allowance paywall (JIKU-34), not a generic error. */
  paywall: boolean;
}

export async function sendInvitationsAction(
  eventId: string,
  channels: string[],
): Promise<{ ok: true; data: { queued: number } } | SendInvitationsFailure> {
  const t = await errors();
  if (channels.length === 0) {
    return { ok: false, error: t("noChannel"), paywall: false };
  }
  const params = new URLSearchParams({ channels: channels.join(",") });
  const response = await serverFetch(`/events/${eventId}/invitations/send?${params.toString()}`, {
    method: "POST",
  });
  if (response.ok) {
    const data = (await response.json()) as { queued: number };
    revalidatePath(eventGuestsRoute(eventId));
    return { ok: true, data };
  }
  reportApiError(response);
  if (response.status === 402) {
    return { ok: false, paywall: true, error: t("allowanceReached") };
  }
  return { ok: false, paywall: false, error: t("sendFailed") };
}

/**
 * Rattache un invité à une catégorie d'accès, ou l'en détache (JIKU-93).
 *
 * Un 409 signifie que la catégorie visée est complète : le backend a refusé
 * plutôt que de la faire déborder, et l'invité est resté où il était.
 */
export async function setGuestTicketTypeAction(
  eventId: string,
  guestId: string,
  ticketTypeId: string | null,
): Promise<ActionResult<Guest>> {
  const t = await errors();
  const response = await serverFetch(`/events/${eventId}/guests/${guestId}/ticket-type`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticketTypeId }),
  });
  const result = await fromResponse<Guest>(response, {
    409: t("categoryFull"),
    default: t("categoryFailed"),
  });
  if (result.ok) {
    revalidatePath(eventGuestsRoute(eventId));
  }
  return result;
}
