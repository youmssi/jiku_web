"use server";

import { serverFetch } from "@/lib/api-server";
import { fromResponse } from "@/lib/action-result";
import type { ActionResult } from "@/lib/action-result";
import type {
  ReminderPolicyUpdate,
  ResourceAvailability,
  ResourceType,
  ResourceUnavailability,
  ServiceConfiguration,
  ServiceRequirement,
  ServiceResource,
  ServiceSummary,
  StaffLink,
  StaffLinkCreated,
} from "./schema";

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

/** Crée un service (JIKU-84+) : nom + fuseau. */
export async function createServiceAction(
  name: string,
  timezone: string,
): Promise<ActionResult<ServiceSummary>> {
  const response = await serverFetch(`/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, timezone }),
  });
  return fromResponse<ServiceSummary>(response, {
    default: "Impossible de créer le service.",
  });
}

/** Renomme un service (JIKU-84+). */
export async function renameServiceAction(
  serviceId: string,
  name: string,
): Promise<ActionResult<ServiceSummary>> {
  const response = await serverFetch(`/services/${serviceId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return fromResponse<ServiceSummary>(response, {
    404: "Ce service est introuvable.",
    default: "Impossible de renommer le service.",
  });
}

/** Supprime un service et tout ce qui lui appartenait (créneaux, billets, ressources liées). */
export async function deleteServiceAction(serviceId: string): Promise<ActionResult<null>> {
  const response = await serverFetch(`/services/${serviceId}`, { method: "DELETE" });
  if (!response.ok) {
    return fromResponse<null>(response, {
      404: "Ce service est introuvable.",
      default: "Impossible de supprimer le service.",
    });
  }
  return { ok: true, data: null };
}

/** Lien de réservation public d'un service : code court, plus l'ancien jeton signé. */
export async function fetchBookingLinkAction(
  serviceId: string,
): Promise<ActionResult<{ token: string; shortCode: string }>> {
  const response = await serverFetch(`/services/${serviceId}/booking-link`);
  return fromResponse<{ token: string; shortCode: string }>(response, {
    404: "Ce service est introuvable.",
    default: "Impossible de générer le lien de réservation.",
  });
}

export async function listStaffLinksAction(serviceId: string): Promise<ActionResult<StaffLink[]>> {
  const response = await serverFetch(`/services/${serviceId}/staff-links`);
  return fromResponse<StaffLink[]>(response, {
    default: "Impossible de charger les liens de comptoir.",
  });
}

export async function createStaffLinkAction(
  serviceId: string,
  label: string,
): Promise<ActionResult<StaffLinkCreated>> {
  const response = await serverFetch(`/services/${serviceId}/staff-links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label }),
  });
  return fromResponse<StaffLinkCreated>(response, {
    default: "Impossible de créer le lien de comptoir.",
  });
}

export async function revokeStaffLinkAction(serviceId: string, staffId: string): Promise<ActionResult<null>> {
  const response = await serverFetch(`/services/${serviceId}/staff-links/${staffId}`, {
    method: "DELETE",
  });
  return response.ok ? { ok: true, data: null } : fromResponse<null>(response, {
    default: "Impossible de révoquer le lien.",
  });
}

export async function listResourcesAction(): Promise<ActionResult<ServiceResource[]>> {
  const response = await serverFetch(`/resources`);
  return fromResponse<ServiceResource[]>(response, {
    default: "Impossible de charger les ressources.",
  });
}

export async function createResourceAction(
  name: string,
  type: ResourceType,
  timezone: string,
): Promise<ActionResult<ServiceResource>> {
  const response = await serverFetch(`/resources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, type, timezone }),
  });
  return fromResponse<ServiceResource>(response, {
    default: "Impossible de créer la ressource.",
  });
}

export async function setResourceActiveAction(id: string, active: boolean): Promise<ActionResult<ServiceResource>> {
  const response = await serverFetch(`/resources/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active }),
  });
  return fromResponse<ServiceResource>(response, {
    default: "Impossible de mettre à jour la ressource.",
  });
}

export async function listRequirementsAction(serviceId: string): Promise<ActionResult<ServiceRequirement[]>> {
  const response = await serverFetch(`/services/${serviceId}/requirements`);
  return fromResponse<ServiceRequirement[]>(response, {
    default: "Impossible de charger les exigences.",
  });
}

export async function addRequirementAction(
  serviceId: string,
  type: ResourceType,
  quantity: number,
): Promise<ActionResult<ServiceRequirement>> {
  const response = await serverFetch(`/services/${serviceId}/requirements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, quantity }),
  });
  return fromResponse<ServiceRequirement>(response, {
    default: "Impossible d'ajouter l'exigence.",
  });
}

export async function removeRequirementAction(serviceId: string, requirementId: string): Promise<ActionResult<null>> {
  const response = await serverFetch(`/services/${serviceId}/requirements/${requirementId}`, {
    method: "DELETE",
  });
  return response.ok ? { ok: true, data: null } : fromResponse<null>(response, {
    default: "Impossible de retirer l'exigence.",
  });
}

export async function listAvailabilityAction(resourceId: string): Promise<ActionResult<ResourceAvailability[]>> {
  const response = await serverFetch(`/resources/${resourceId}/availability`);
  return fromResponse<ResourceAvailability[]>(response, { default: "Impossible de charger les horaires." });
}

export async function addAvailabilityAction(
  resourceId: string,
  dayOfWeek: number,
  start: string,
  end: string,
): Promise<ActionResult<ResourceAvailability>> {
  const response = await serverFetch(`/resources/${resourceId}/availability`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dayOfWeek, start, end }),
  });
  return fromResponse<ResourceAvailability>(response, { default: "Impossible d'ajouter l'horaire." });
}

export async function removeAvailabilityAction(resourceId: string, availabilityId: string): Promise<ActionResult<null>> {
  const response = await serverFetch(`/resources/${resourceId}/availability/${availabilityId}`, { method: "DELETE" });
  return response.ok ? { ok: true, data: null } : fromResponse<null>(response, { default: "Impossible de retirer l'horaire." });
}

export async function listUnavailabilityAction(resourceId: string): Promise<ActionResult<ResourceUnavailability[]>> {
  const response = await serverFetch(`/resources/${resourceId}/unavailability`);
  return fromResponse<ResourceUnavailability[]>(response, { default: "Impossible de charger les indisponibilités." });
}

export async function addUnavailabilityAction(
  resourceId: string,
  startsAt: string,
  endsAt: string,
): Promise<ActionResult<ResourceUnavailability>> {
  const response = await serverFetch(`/resources/${resourceId}/unavailability`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ startsAt, endsAt }),
  });
  return fromResponse<ResourceUnavailability>(response, { default: "Impossible d'ajouter l'indisponibilité." });
}

export async function removeUnavailabilityAction(resourceId: string, unavailabilityId: string): Promise<ActionResult<null>> {
  const response = await serverFetch(`/resources/${resourceId}/unavailability/${unavailabilityId}`, { method: "DELETE" });
  return response.ok ? { ok: true, data: null } : fromResponse<null>(response, { default: "Impossible de retirer l'indisponibilité." });
}
