"use server";

import { serverFetch } from "@/lib/api-server";
import { fromResponse } from "@/lib/action-result";
import type { ActionResult } from "@/lib/action-result";
import type { ReminderPolicyUpdate, ServiceConfiguration } from "./schema";

// ─── Configuration d'un service (JIKU-89) ───────────────────────────────────

export async function fetchServiceConfigurationAction(
  serviceId: string,
): Promise<ActionResult<ServiceConfiguration>> {
  const response = await serverFetch(`/services/${serviceId}/configuration`);
  return fromResponse<ServiceConfiguration>(response, {
    404: "Ce service est introuvable.",
    default: "Impossible de charger la configuration du service.",
  });
}

export async function updateReminderPolicyAction(
  serviceId: string,
  update: ReminderPolicyUpdate,
): Promise<ActionResult<ServiceConfiguration>> {
  const response = await serverFetch(`/services/${serviceId}/configuration`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
  return fromResponse<ServiceConfiguration>(response, {
    404: "Ce service est introuvable.",
    default: "Impossible d'enregistrer la configuration.",
  });
}
