"use server";

import { revalidatePath } from "next/cache";
import { serverFetch } from "@/lib/api-server";
import { eventGuestsRoute } from "@/lib/constants";
import { type ActionResult, fail, fromResponse } from "@/lib/action-result";
import {
  GUEST_CSV_HEADERS,
  type ImportResult,
  type SingleGuestInput,
} from "@/components/modules/guest/schema";

/** Quote a CSV cell when it contains a delimiter, quote or newline (RFC 4180). */
function csvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

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
  guest: SingleGuestInput,
): Promise<ActionResult<ImportResult>> {
  const row = [guest.firstName, guest.lastName, guest.email, guest.phone];
  const csv = `${GUEST_CSV_HEADERS.join(",")}\n${row.map(csvCell).join(",")}\n`;
  const body = new FormData();
  body.append("file", new File([csv], "guest.csv", { type: "text/csv" }));
  const response = await serverFetch(`/events/${eventId}/guests/import`, {
    method: "POST",
    body,
  });
  const result = await fromResponse<ImportResult>(response, {
    default: "We couldn't add this guest. Please try again.",
  });
  if (result.ok) {
    revalidatePath(eventGuestsRoute(eventId));
  }
  return result;
}

export async function sendInvitationsAction(
  eventId: string,
  channels: string[],
): Promise<ActionResult<{ queued: number }>> {
  if (channels.length === 0) {
    return fail("Select at least one channel.");
  }
  const params = new URLSearchParams({ channels: channels.join(",") });
  const response = await serverFetch(
    `/events/${eventId}/invitations/send?${params.toString()}`,
    { method: "POST" },
  );
  const result = await fromResponse<{ queued: number }>(response, {
    default: "We couldn't send the invitations. Please try again.",
  });
  if (result.ok) {
    revalidatePath(eventGuestsRoute(eventId));
  }
  return result;
}
