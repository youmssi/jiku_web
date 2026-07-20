"use server";

import { revalidatePath } from "next/cache";
import { publicFetch } from "@/lib/api-server";
import { invitationRoute } from "@/lib/constants";
import { type ActionResult, fail, ok, reportApiError } from "@/lib/action-result";
import type { TransferTicketInput } from "@/components/modules/invitation/schema";

async function submit(token: string, action: "confirm" | "decline"): Promise<ActionResult> {
  const response = await publicFetch(`/rsvp/${token}/${action}`, { method: "POST" });
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

/**
 * Hands the ticket to someone else (JIKU-transfer, pending backend endpoint —
 * see schema.ts). Wired up ahead of the backend so the guest flow ships the
 * moment `POST /rsvp/{token}/transfer` exists; until then it fails with the
 * generic message below rather than a raw 404.
 */
export async function transferTicketAction(
  token: string,
  input: TransferTicketInput,
): Promise<ActionResult> {
  const response = await publicFetch(`/rsvp/${token}/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    reportApiError(response);
    if (response.status === 409) {
      return fail("Transfers are closed for this event.");
    }
    if (response.status === 404) {
      return fail("Ticket transfer isn't available yet.");
    }
    return fail("Something went wrong. Please try again.");
  }
  revalidatePath(invitationRoute(token));
  return ok(null);
}

export async function requestErasureAction(token: string): Promise<ActionResult> {
  const response = await publicFetch(`/rsvp/${token}/erase`, { method: "POST" });
  if (!response.ok) {
    reportApiError(response);
    return fail("We couldn't delete your data just now. Please try again.");
  }
  revalidatePath(invitationRoute(token));
  return ok(null);
}
