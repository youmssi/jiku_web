"use server";

import { revalidatePath } from "next/cache";
import { serverFetch } from "@/lib/api-server";
import { eventGuestsRoute } from "@/lib/constants";
import type { ImportResult } from "@/components/modules/guest/schema";

export async function importGuestsAction(
  eventId: string,
  formData: FormData,
): Promise<{ result?: ImportResult; error?: string }> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a CSV file." };
  }
  const body = new FormData();
  body.append("file", file);
  const response = await serverFetch(`/events/${eventId}/guests/import`, {
    method: "POST",
    body,
  });
  if (response.status === 400) {
    return { error: "The file is missing required columns (firstName, lastName, email, phone)." };
  }
  if (!response.ok) {
    return { error: "The import failed. Please try again." };
  }
  const result = (await response.json()) as ImportResult;
  revalidatePath(eventGuestsRoute(eventId));
  return { result };
}

export async function sendInvitationsAction(
  eventId: string,
  channels: string[],
): Promise<{ queued?: number; error?: string }> {
  if (channels.length === 0) {
    return { error: "Select at least one channel." };
  }
  const params = new URLSearchParams({ channels: channels.join(",") });
  const response = await serverFetch(`/events/${eventId}/invitations/send?${params.toString()}`, {
    method: "POST",
  });
  if (!response.ok) {
    return { error: "We couldn't send the invitations. Please try again." };
  }
  const data = (await response.json()) as { queued: number };
  revalidatePath(eventGuestsRoute(eventId));
  return { queued: data.queued };
}
