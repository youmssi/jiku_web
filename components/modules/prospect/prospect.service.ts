"use server";

import { serverFetch } from "@/lib/api-server";
import { fail, reportApiError } from "@/lib/action-result";
import type { ProspectLeadRequest } from "./schema";

/**
 * Enregistre un professionnel intéressé par la prise de rendez-vous (JIKU-98).
 *
 * Le point d'API est public : le prospect n'a pas de compte, et lui en demander un
 * avant d'avoir montré la moindre valeur ferait chuter la conversion. La limitation
 * de débit côté serveur est la seule protection, et c'est le bon compromis ici.
 */
export async function registerProspectAction(
  input: ProspectLeadRequest,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const response = await serverFetch("/prospects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (response.status === 400) {
    return fail("Vérifiez les champs : le nom de l'activité, votre nom et le téléphone sont nécessaires.");
  }
  if (response.status === 429) {
    return fail("Trop de tentatives. Réessayez dans une minute.");
  }
  if (!response.ok) {
    reportApiError(response);
    return fail("L'enregistrement n'a pas abouti. Réessayez, ou écrivez-nous sur WhatsApp.");
  }
  return { ok: true };
}
