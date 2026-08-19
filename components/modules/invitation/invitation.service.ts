"use server";

import { revalidatePath } from "next/cache";
import { publicFetch } from "@/lib/api-server";
import { invitationRoute } from "@/lib/constants";
import { type ActionResult, fail, ok, reportApiError } from "@/lib/action-result";
import {
  transferTicketSchema,
  type TransferTicketInput,
} from "@/components/modules/invitation/schema";

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
 * Hands this guest's place to someone else (JIKU-64). The backend re-checks every
 * condition the UI used to decide whether to offer the control, so a 409 here is
 * a genuine state change (transfers closed, deadline passed, already scanned in)
 * rather than a client bug — surface its reason rather than a generic failure.
 */
export async function transferTicketAction(
  token: string,
  input: TransferTicketInput,
): Promise<ActionResult> {
  const parsed = transferTicketSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please check the recipient's details and try again.");
  }
  const response = await publicFetch(`/rsvp/${token}/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email || null,
      phoneNumber: parsed.data.phoneNumber || null,
    }),
  });
  if (!response.ok) {
    reportApiError(response);
    if (response.status === 409) {
      return fail(
        "This place can no longer be transferred — transfers may have closed, or the ticket has already been used at the entrance.",
      );
    }
    if (response.status === 400) {
      return fail("Give the recipient an email address or a phone number.");
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
