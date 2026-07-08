"use server";

import { revalidatePath } from "next/cache";
import { serverFetch } from "@/lib/api-server";
import { eventGuestsRoute } from "@/lib/constants";
import { type ActionResult, fail, fromResponse } from "@/lib/action-result";
import type { ImportResult, SingleGuestInput } from "@/components/modules/guest/schema";

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
