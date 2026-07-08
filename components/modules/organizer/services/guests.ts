"use server";

import { revalidatePath } from "next/cache";
import { serverFetch } from "@/lib/api-server";
import { eventGuestsRoute } from "@/lib/constants";
import type { ImportResult } from "@/components/modules/organizer/guest-types";

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
): Promise<{ queued?: number; error?: string; paywall?: boolean }> {
  if (channels.length === 0) {
    return { error: "Select at least one channel." };
  }
  const params = new URLSearchParams({ channels: channels.join(",") });
  const response = await serverFetch(`/events/${eventId}/invitations/send?${params.toString()}`, {
    method: "POST",
  });
  // 402 Payment Required: the send would exceed the event's guest allowance. The
  // backend is the authority here; surface its message and flag the paywall so the
  // UI can offer a path to purchase capacity.
  if (response.status === 402) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    return {
      paywall: true,
      error:
        body?.message ??
        "This event's guest allowance would be exceeded. Purchase additional capacity to send.",
    };
  }
  if (!response.ok) {
    return { error: "We couldn't send the invitations. Please try again." };
  }
  const data = (await response.json()) as { queued: number };
  revalidatePath(eventGuestsRoute(eventId));
  return { queued: data.queued };
}
