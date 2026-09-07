"use server";

import { serverFetch } from "@/lib/api-server";
import { fromResponse, type ActionResult } from "@/lib/action-result";

/**
 * Validator door-link management (organizer, authenticated). One link per entrance
 * ("Entrée principale", "VIP"...) is minted for a published event and handed to a
 * door person; it is shown exactly once (at creation) and can be revoked at any
 * time. The backend keeps the same shape for list/create/revoke.
 */
export interface ValidatorLink {
  id: string;
  label: string;
  /** Shareable check-in link; only present on the creation response. */
  link: string;
  revoked: boolean;
  createdAt: string;
  revokedAt: string | null;
}

function requestMessages(): Partial<Record<number, string>> & { default?: string } {
  return {
    409: "Publiez d'abord l'événement pour créer des liens de portier.",
    404: "Cet événement est introuvable.",
    default: "L'action a échoué. Réessayez.",
  };
}

export async function listValidatorLinks(eventId: string): Promise<ActionResult<ValidatorLink[]>> {
  const response = await serverFetch(`/events/${eventId}/validators`);
  return fromResponse<ValidatorLink[]>(response, {
    404: "Cet événement est introuvable.",
    default: "Impossible de charger les liens de portier.",
  });
}

export async function createValidatorLink(
  eventId: string,
  label: string,
): Promise<ActionResult<ValidatorLink>> {
  const response = await serverFetch(`/events/${eventId}/validators`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label }),
  });
  return fromResponse<ValidatorLink>(response, requestMessages());
}

export async function revokeValidatorLink(
  eventId: string,
  validatorId: string,
): Promise<ActionResult<ValidatorLink>> {
  const response = await serverFetch(`/events/${eventId}/validators/${validatorId}/revoke`, {
    method: "POST",
  });
  return fromResponse<ValidatorLink>(response, requestMessages());
}
