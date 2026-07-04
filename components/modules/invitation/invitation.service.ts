"use server";

import { revalidatePath } from "next/cache";
import { apiBaseUrl } from "@/lib/api";
import { invitationRoute } from "@/lib/constants";
import { type ActionResult, fail, ok, reportApiError } from "@/lib/action-result";

async function submit(token: string, action: "confirm" | "decline"): Promise<ActionResult> {
  const response = await fetch(`${apiBaseUrl()}/rsvp/${token}/${action}`, {
    method: "POST",
    cache: "no-store",
  });
  if (!response.ok) {
    reportApiError(response);
    return fail(
      response.status === 409 ? "This event is full." : "Something went wrong. Please try again.",
    );
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

export async function requestErasureAction(token: string): Promise<ActionResult> {
  const response = await fetch(`${apiBaseUrl()}/rsvp/${token}/erase`, {
    method: "POST",
    cache: "no-store",
  });
  if (!response.ok) {
    reportApiError(response);
    return fail("We couldn't delete your data just now. Please try again.");
  }
  revalidatePath(invitationRoute(token));
  return ok(null);
}
