"use server";

import { revalidatePath } from "next/cache";
import { apiBaseUrl } from "@/lib/api";
import { invitationRoute } from "@/lib/constants";

async function submit(token: string, action: "confirm" | "decline"): Promise<{ error?: string }> {
  const response = await fetch(`${apiBaseUrl()}/rsvp/${token}/${action}`, {
    method: "POST",
    cache: "no-store",
  });
  if (response.status === 409) {
    return { error: "This event is full." };
  }
  if (!response.ok) {
    return { error: "Something went wrong. Please try again." };
  }
  revalidatePath(invitationRoute(token));
  return {};
}

export async function confirmRsvpAction(token: string): Promise<{ error?: string }> {
  return submit(token, "confirm");
}

export async function declineRsvpAction(token: string): Promise<{ error?: string }> {
  return submit(token, "decline");
}
