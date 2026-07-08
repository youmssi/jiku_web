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
  if (response.status === 410) {
    return { error: "This event has been cancelled." };
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

export async function requestErasureAction(token: string): Promise<{ error?: string }> {
  const response = await fetch(`${apiBaseUrl()}/rsvp/${token}/erase`, {
    method: "POST",
    cache: "no-store",
  });
  if (!response.ok) {
    return { error: "We couldn't delete your data just now. Please try again." };
  }
  revalidatePath(invitationRoute(token));
  return {};
}
