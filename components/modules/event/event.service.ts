"use server";

import { getTranslations } from "next-intl/server";
import { serverFetch } from "@/lib/api-server";
import { type ActionResult, fail, ok, reportApiError } from "@/lib/action-result";
import { toMinorUnits } from "@/lib/currency";
import { localInputToUtc } from "@/lib/datetime";
import {
  eventFormSchema,
  QUORUM_FRACTIONS,
  quorumFormSchema,
  ticketTypeFormSchema,
  type EventFormValues,
  type QuorumFormValues,
  type TicketTypeFormValues,
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

function errors() {
  return getTranslations("events.errors");
}

export async function createDraftAction(
  values: EventFormValues,
): Promise<ActionResult<{ id: string }>> {
  const t = await getTranslations("events.create");
  const parsed = eventFormSchema.safeParse(values);
  if (!parsed.success) {
    return fail(t("failed"));
  }
  const response = await serverFetch("/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(parsed.data)),
  });
  if (!response.ok) {
    reportApiError(response);
    return fail(t("failed"));
  }
  const event = (await response.json()) as { id: string };
  return ok(event);
}

export async function updateDraftAction(
  id: string,
  values: EventFormValues,
): Promise<ActionResult> {
  const t = await errors();
  const parsed = eventFormSchema.safeParse(values);
  if (!parsed.success) {
    return fail(t("invalid"));
  }
  const response = await serverFetch(`/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(parsed.data)),
  });
  if (response.status === 409) {
    return fail(t("locked"));
  }
  if (!response.ok) {
    reportApiError(response);
    return fail(t("saveFailed"));
  }
  return ok(null);
}

export async function publishEventAction(id: string): Promise<ActionResult> {
  const t = await errors();
  const response = await serverFetch(`/events/${id}/publish`, { method: "POST" });
  if (response.status === 422) {
    return fail(t("publishIncomplete"));
  }
  if (!response.ok) {
    reportApiError(response);
    return fail(t("publishFailed"));
  }
  return ok(null);
}

export async function cancelEventAction(
  id: string,
  notifyGuests: boolean = true,
): Promise<ActionResult> {
  const t = await errors();
  const response = await serverFetch(`/events/${id}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notifyGuests }),
  });
  if (response.status === 409) {
    return fail(t("cancelNotPublished"));
  }
  if (!response.ok) {
    reportApiError(response);
    return fail(t("cancelFailed"));
  }
  return ok(null);
}

export async function deleteEventAction(id: string): Promise<ActionResult> {
  const t = await errors();
  const response = await serverFetch(`/events/${id}`, { method: "DELETE" });
  if (response.status === 409) {
    return fail(t("deletePublished"));
  }
  if (!response.ok) {
    reportApiError(response);
    return fail(t("deleteFailed"));
  }
  return ok(null);
}

/**
 * Enregistre la règle de quorum (JIKU-94). Séparée de la mise à jour de
 * l'événement : c'est une règle statutaire, pas un réglage de présentation.
 */
export async function saveQuorumAction(
  eventId: string,
  values: QuorumFormValues,
): Promise<ActionResult> {
  const t = await errors();
  const parsed = quorumFormSchema.safeParse(values);
  if (!parsed.success) {
    return fail(t("quorumInvalid"));
  }
  const { mode, fraction, absolute } = parsed.data;
  const share = QUORUM_FRACTIONS.find((candidate) => candidate.key === fraction) ?? QUORUM_FRACTIONS[0];
  const response = await serverFetch(`/events/${eventId}/quorum`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode,
      numerator: mode === "FRACTION" ? share.numerator : null,
      denominator: mode === "FRACTION" ? share.denominator : null,
      absolute: mode === "ABSOLUTE" ? absolute : null,
    }),
  });
  if (response.status === 400) {
    return fail(t("quorumInvalid"));
  }
  if (!response.ok) {
    reportApiError(response);
    return fail(t("quorumFailed"));
  }
  return ok(null);
}

/**
 * Catégories d'accès (JIKU-93). Le plafond par catégorie est facultatif : une
 * catégorie sans plafond n'est bornée que par la capacité de l'événement. Le
 * prix arrive en unités principales et part en unités mineures, dans la devise
 * de l'organisation.
 */
export async function saveTicketTypeAction(
  eventId: string,
  typeId: string | null,
  values: TicketTypeFormValues,
  context: { position: number; currency: string },
): Promise<ActionResult<{ id: string }>> {
  const t = await errors();
  const parsed = ticketTypeFormSchema.safeParse(values);
  if (!parsed.success) {
    return fail(t("invalid"));
  }
  const { label, colorHex, maxCapacity, price } = parsed.data;
  const response = await serverFetch(
    typeId ? `/events/${eventId}/ticket-types/${typeId}` : `/events/${eventId}/ticket-types`,
    {
      method: typeId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label,
        colorHex,
        maxCapacity,
        position: context.position,
        priceMinor: price === null || price === 0 ? null : toMinorUnits(price, context.currency),
      }),
    },
  );
  if (response.status === 409) {
    return fail(t(typeId ? "ticketTypeLocked" : "ticketTypeDuplicate"));
  }
  if (!response.ok) {
    reportApiError(response);
    return fail(t("ticketTypeFailed"));
  }
  return ok((await response.json()) as { id: string });
}

export async function deleteTicketTypeAction(
  eventId: string,
  typeId: string,
): Promise<ActionResult<null>> {
  const t = await errors();
  const response = await serverFetch(`/events/${eventId}/ticket-types/${typeId}`, {
    method: "DELETE",
  });
  // 409: guests still hold this category; the backend names how many.
  if (response.status === 409) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null;
    const count = Number(body?.detail?.match(/\((\d+) affected\)/)?.[1] ?? 0);
    return fail(t("ticketTypeInUse", { count }));
  }
  if (!response.ok) {
    reportApiError(response);
    return fail(t("ticketTypeDeleteFailed"));
  }
  return ok(null);
}
