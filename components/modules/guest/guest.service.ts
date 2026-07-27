"use server";

import { revalidatePath } from "next/cache";
import { serverFetch } from "@/lib/api-server";
import { eventGuestsRoute } from "@/lib/constants";
import { type ActionResult, fail, fromResponse, reportApiError } from "@/lib/action-result";
import type { Guest, ImportResult, SingleGuestInput } from "@/components/modules/guest/schema";

export async function importGuestsAction(
  eventId: string,
  formData: FormData,
): Promise<ActionResult<ImportResult>> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return fail("Please choose a CSV file.");
  }
  const body = new FormData();
  body.append("file", file);
  const response = await serverFetch(`/events/${eventId}/guests/import`, {
    method: "POST",
    body,
  });
  const result = await fromResponse<ImportResult>(response, {
    400: "The file is missing required columns (firstName, lastName, email, phone).",
    default: "The import failed. Please try again.",
  });
  if (result.ok) {
    revalidatePath(eventGuestsRoute(eventId));
  }
  return result;
}

export async function addGuestAction(
  eventId: string,
  data: SingleGuestInput,
): Promise<ActionResult<ImportResult>> {
  if (!data.email && !data.phone) {
    return fail("Provide an email or a phone number.");
  }
  const body = new FormData();
  const csvHeader = "firstName,lastName,email,phone";
  const csvRow = `${data.firstName},${data.lastName},${data.email ?? ""},${data.phone ?? ""}`;
  const blob = new Blob([csvHeader + "\n" + csvRow], { type: "text/csv" });
  body.append("file", blob, "guest.csv");
  const response = await serverFetch(`/events/${eventId}/guests/import`, {
    method: "POST",
    body,
  });
  const result = await fromResponse<ImportResult>(response, {
    400: "The file is missing required columns (firstName, lastName, email, phone).",
    default: "We couldn't add this guest. Please try again.",
  });
  if (result.ok) {
    revalidatePath(eventGuestsRoute(eventId));
  }
  return result;
}

export async function removeGuestAction(
  eventId: string,
  guestId: string,
): Promise<ActionResult<null>> {
  const response = await serverFetch(`/events/${eventId}/guests/${guestId}`, {
    method: "DELETE",
  });
  if (response.ok) {
    revalidatePath(eventGuestsRoute(eventId));
    return { ok: true, data: null };
  }
  reportApiError(response);
  return fail(
    response.status === 409
      ? "This guest has already been invited and can no longer be removed. Exclude them instead."
      : "We couldn't remove this guest. Please try again.",
  );
}

export async function setGuestExclusionAction(
  eventId: string,
  guestId: string,
  excluded: boolean,
): Promise<ActionResult<Guest>> {
  const response = await serverFetch(`/events/${eventId}/guests/${guestId}/exclusion`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ excluded }),
  });
  const result = await fromResponse<Guest>(response, {
    default: excluded
      ? "We couldn't exclude this guest. Please try again."
      : "We couldn't include this guest again. Please try again.",
  });
  if (result.ok) {
    revalidatePath(eventGuestsRoute(eventId));
  }
  return result;
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
  if (channels.length === 0) {
    return { ok: false, error: "Select at least one channel.", paywall: false };
  }
  const params = new URLSearchParams({ channels: channels.join(",") });
  const response = await serverFetch(
    `/events/${eventId}/invitations/send?${params.toString()}`,
    { method: "POST" },
  );
  if (response.ok) {
    const data = (await response.json()) as { queued: number };
    revalidatePath(eventGuestsRoute(eventId));
    return { ok: true, data };
  }
  reportApiError(response);
  if (response.status === 402) {
    const detail = await response
      .json()
      .then((body: { detail?: string }) => body.detail)
      .catch(() => undefined);
    return {
      ok: false,
      paywall: true,
      error: detail ?? "This event's guest allowance has been reached.",
    };
  }
  return {
    ok: false,
    paywall: false,
    error: "We couldn't send the invitations. Please try again.",
  };
}
