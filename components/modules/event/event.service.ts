"use server";

import { serverFetch } from "@/lib/api-server";
import { reportApiError } from "@/lib/action-result";
import { localInputToUtc } from "@/lib/datetime";
import {
  eventFormSchema,
  type EventFormValues,
} from "@/components/modules/event/schema";

function toPayload(values: EventFormValues) {
  return {
    name: values.name,
    description: values.description || null,
    startDateTime: localInputToUtc(values.startLocal, values.timezone),
    endDateTime: localInputToUtc(values.endLocal, values.timezone),
    timezone: values.timezone,
    location: values.location || null,
    settings: {
      placementEnabled: values.placementEnabled,
      transferAllowed: values.transferAllowed,
      transferDeadline: values.transferAllowed
        ? localInputToUtc(values.transferDeadlineLocal, values.timezone)
        : null,
      overbookingAllowed: values.overbookingAllowed,
      maxOverbookingCount: values.overbookingAllowed ? values.maxOverbookingCount : null,
    },
    invitationChannels: values.invitationChannels,
  };
}

export async function createDraftAction(
  values: EventFormValues,
): Promise<{ error?: string; id?: string }> {
  const parsed = eventFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Please check the form and try again." };
  }
  const response = await serverFetch("/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(parsed.data)),
  });
  if (!response.ok) {
    reportApiError(response);
    return { error: "We couldn't save the draft. Please try again." };
  }
  const event = (await response.json()) as { id: string };
  return { id: event.id };
}

export async function updateDraftAction(
  id: string,
  values: EventFormValues,
): Promise<{ error?: string }> {
  const parsed = eventFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Please check the form and try again." };
  }
  const response = await serverFetch(`/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(parsed.data)),
  });
  if (response.status === 409) {
    return { error: "This event can no longer be edited." };
  }
  if (!response.ok) {
    reportApiError(response);
    return { error: "We couldn't save your changes. Please try again." };
  }
  return {};
}

export async function publishEventAction(id: string): Promise<{ error?: string }> {
  const response = await serverFetch(`/events/${id}/publish`, { method: "POST" });
  if (response.status === 422) {
    return { error: "The event still needs a name, a start time and an invitation channel." };
  }
  if (!response.ok) {
    reportApiError(response);
    return { error: "We couldn't publish the event. Please try again." };
  }
  return {};
}
