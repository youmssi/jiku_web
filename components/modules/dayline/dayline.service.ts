"use server";

import { serverFetch, publicFetch } from "@/lib/api-server";
import { type ActionResult, fromResponse } from "@/lib/action-result";
import type {
  DayLineAuth,
  DayLineView,
  LineActionResult,
  LineTicket,
  LineTransition,
  WalkInInput,
} from "@/components/modules/dayline/schema";

/**
 * Day-line console service layer (JIKU-88). The same operations serve the two
 * entrances of the console: the organizer (authenticated, `/services/{id}/day-line`)
 * and the counter staff (signed link in the path, `/line/{token}`). Which surface
 * is used is carried by [DayLineAuth]; the backend endpoints are otherwise identical.
 */

function basePath(auth: DayLineAuth): string {
  return auth.kind === "organizer"
    ? `/services/${auth.serviceId}/day-line`
    : `/line/${auth.token}`;
}

function fetchFor(auth: DayLineAuth, path: string, init: RequestInit = {}): Promise<Response> {
  return auth.kind === "organizer" ? serverFetch(path, init) : publicFetch(path, init);
}

function lineMessages(staff: boolean): Partial<Record<number, string>> & { default?: string } {
  return {
    409: "Cette entrée vient d'être traitée par un autre poste — la liste est à jour.",
    404: staff
      ? "Ce lien n'est plus valide."
      : "Cette entrée n'existe pas ou n'appartient pas à ce service.",
    default: "L'action a échoué. Réessayez.",
  };
}

/** La ligne du jour du service (liste initiale et rafraîchissements). */
export async function fetchDayLineAction(
  auth: DayLineAuth,
): Promise<ActionResult<DayLineView>> {
  const response = await fetchFor(auth, basePath(auth));
  return fromResponse<DayLineView>(response, {
    404: auth.kind === "staff" ? "Ce lien de comptoir n'est plus valide." : "Ce service est introuvable.",
    default: "Impossible de charger la ligne du jour.",
  });
}

/** Appelle la personne suivante ; ticket nul si personne n'attend. */
export async function nextAction(auth: DayLineAuth): Promise<ActionResult<{ ticket: LineTicket | null }>> {
  const response = await fetchFor(auth, `${basePath(auth)}/next`, {
    method: "POST",
  });
  return fromResponse<{ ticket: LineTicket | null }>(response, lineMessages(auth.kind === "staff"));
}

/** Inscrit un sans-rendez-vous au comptoir ; renvoie la ligne actualisée. */
export async function walkInAction(
  auth: DayLineAuth,
  input: WalkInInput,
): Promise<ActionResult<DayLineView>> {
  const response = await fetchFor(auth, `${basePath(auth)}/walk-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return fromResponse<DayLineView>(response, {
    409: "Ce service n'accueille pas de sans-rendez-vous.",
    default: "L'inscription a échoué. Réessayez.",
  });
}

/** Transition d'une entrée de la ligne : arrivée, appel, prise en charge, fin, absent. */
export async function transitionAction(
  auth: DayLineAuth,
  ticketCode: string,
  transition: LineTransition,
): Promise<ActionResult<LineActionResult>> {
  const response = await fetchFor(auth, `${basePath(auth)}/tickets/${ticketCode}/${transition}`, {
    method: "POST",
  });
  return fromResponse<LineActionResult>(response, lineMessages(auth.kind === "staff"));
}
