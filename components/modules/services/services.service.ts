"use server";

import { getTranslations } from "next-intl/server";
import { serverFetch } from "@/lib/api-server";
import { fail, fromResponse } from "@/lib/action-result";
import type { ActionResult } from "@/lib/action-result";
import { createServiceSchema, type CreateServiceInput } from "./schema";
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

export async function fetchServiceConfigurationAction(
  serviceId: string,
): Promise<ActionResult<ServiceConfiguration>> {
  const t = await getTranslations("services.errors");
  const response = await serverFetch(`/services/${serviceId}/configuration`);
  return fromResponse<ServiceConfiguration>(response, {
    404: t("notFound"),
    default: t("loadConfig"),
  });
}

export async function updateReminderPolicyAction(
  serviceId: string,
  update: ReminderPolicyUpdate,
): Promise<ActionResult<ServiceConfiguration>> {
  const t = await getTranslations("services.errors");
  const response = await serverFetch(`/services/${serviceId}/configuration`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
  return fromResponse<ServiceConfiguration>(response, {
    404: t("notFound"),
    default: t("saveConfig"),
  });
}

/** Sets how many clients one slot takes together (group sessions, capped by the plan). */
export async function updateClientsPerSlotAction(
  serviceId: string,
  clientsPerSlot: number,
): Promise<ActionResult<ServiceConfiguration>> {
  const t = await getTranslations("services.errors");
  const response = await serverFetch(`/services/${serviceId}/configuration`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientsPerSlot }),
  });
  return fromResponse<ServiceConfiguration>(response, {
    404: t("notFound"),
    409: t("groupTooLarge"),
    default: t("saveConfig"),
  });
}

/** Fetches one service's name for navigation chrome (breadcrumbs); null when unavailable. */
export async function getServiceNameAction(serviceId: string): Promise<string | null> {
  const response = await serverFetch(`/services/${serviceId}`);
  if (!response.ok) {
    return null;
  }
  const service = (await response.json().catch(() => null)) as { name?: string } | null;
  return service?.name ?? null;
}

/** Crée un service (JIKU-84+) : nom + fuseau. */
export async function createServiceAction(
  input: CreateServiceInput,
): Promise<ActionResult<ServiceSummary>> {
  const parsed = createServiceSchema.safeParse(input);
  const t = await getTranslations("services.create");
  if (!parsed.success) return fail(t("failed"));
  const response = await serverFetch(`/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  return fromResponse<ServiceSummary>(response, { default: t("failed") });
}

/** Renomme un service (JIKU-84+). */
export async function renameServiceAction(
  serviceId: string,
  name: string,
): Promise<ActionResult<ServiceSummary>> {
  const t = await getTranslations("services.errors");
  const response = await serverFetch(`/services/${serviceId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return fromResponse<ServiceSummary>(response, {
    404: t("notFound"),
    default: t("rename"),
  });
}

/** Supprime un service et tout ce qui lui appartenait (créneaux, billets, ressources liées). */
export async function deleteServiceAction(serviceId: string): Promise<ActionResult<null>> {
  const t = await getTranslations("services.errors");
  const response = await serverFetch(`/services/${serviceId}`, { method: "DELETE" });
  if (!response.ok) {
    return fromResponse<null>(response, {
      404: t("notFound"),
      default: t("delete"),
    });
  }
  return { ok: true, data: null };
}

/** Lien de réservation public d'un service : code court, plus l'ancien jeton signé. */
export async function fetchBookingLinkAction(
  serviceId: string,
): Promise<ActionResult<{ token: string; shortCode: string }>> {
  const t = await getTranslations("services.errors");
  const response = await serverFetch(`/services/${serviceId}/booking-link`);
  return fromResponse<{ token: string; shortCode: string }>(response, {
    404: t("notFound"),
    default: t("bookingLink"),
  });
}

export async function listStaffLinksAction(serviceId: string): Promise<ActionResult<StaffLink[]>> {
  const t = await getTranslations("services.errors");
  const response = await serverFetch(`/services/${serviceId}/staff-links`);
  return fromResponse<StaffLink[]>(response, {
    default: t("staffLoad"),
  });
}

export async function createStaffLinkAction(
  serviceId: string,
  label: string,
): Promise<ActionResult<StaffLinkCreated>> {
  const t = await getTranslations("services.errors");
  const response = await serverFetch(`/services/${serviceId}/staff-links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label }),
  });
  return fromResponse<StaffLinkCreated>(response, {
    default: t("staffCreate"),
  });
}

export async function revokeStaffLinkAction(serviceId: string, staffId: string): Promise<ActionResult<null>> {
  const t = await getTranslations("services.errors");
  const response = await serverFetch(`/services/${serviceId}/staff-links/${staffId}`, {
    method: "DELETE",
  });
  return response.ok ? { ok: true, data: null } : fromResponse<null>(response, {
    default: t("staffRevoke"),
  });
}

export async function listResourcesAction(): Promise<ActionResult<ServiceResource[]>> {
  const t = await getTranslations("services.errors");
  const response = await serverFetch(`/resources`);
  return fromResponse<ServiceResource[]>(response, {
    default: t("resourcesLoad"),
  });
}

export async function createResourceAction(
  name: string,
  type: ResourceType,
  timezone: string,
): Promise<ActionResult<ServiceResource>> {
  const t = await getTranslations("services.errors");
  const response = await serverFetch(`/resources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, type, timezone }),
  });
  return fromResponse<ServiceResource>(response, {
    default: t("resourceCreate"),
  });
}

export async function setResourceActiveAction(id: string, active: boolean): Promise<ActionResult<ServiceResource>> {
  const t = await getTranslations("services.errors");
  const response = await serverFetch(`/resources/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active }),
  });
  return fromResponse<ServiceResource>(response, {
    default: t("resourceUpdate"),
  });
}

export async function listRequirementsAction(serviceId: string): Promise<ActionResult<ServiceRequirement[]>> {
  const t = await getTranslations("services.errors");
  const response = await serverFetch(`/services/${serviceId}/requirements`);
  return fromResponse<ServiceRequirement[]>(response, {
    default: t("requirementsLoad"),
  });
}

export async function addRequirementAction(
  serviceId: string,
  type: ResourceType,
  quantity: number,
): Promise<ActionResult<ServiceRequirement>> {
  const t = await getTranslations("services.errors");
  const response = await serverFetch(`/services/${serviceId}/requirements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, quantity }),
  });
  return fromResponse<ServiceRequirement>(response, {
    default: t("requirementAdd"),
  });
}

export async function removeRequirementAction(serviceId: string, requirementId: string): Promise<ActionResult<null>> {
  const t = await getTranslations("services.errors");
  const response = await serverFetch(`/services/${serviceId}/requirements/${requirementId}`, {
    method: "DELETE",
  });
  return response.ok ? { ok: true, data: null } : fromResponse<null>(response, {
    default: t("requirementRemove"),
  });
}

export async function listAvailabilityAction(resourceId: string): Promise<ActionResult<ResourceAvailability[]>> {
  const t = await getTranslations("services.errors");
  const response = await serverFetch(`/resources/${resourceId}/availability`);
  return fromResponse<ResourceAvailability[]>(response, { default: t("availabilityLoad") });
}

export async function addAvailabilityAction(
  resourceId: string,
  dayOfWeek: number,
  start: string,
  end: string,
): Promise<ActionResult<ResourceAvailability>> {
  const t = await getTranslations("services.errors");
  const response = await serverFetch(`/resources/${resourceId}/availability`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dayOfWeek, start, end }),
  });
  return fromResponse<ResourceAvailability>(response, { default: t("availabilityAdd") });
}

export async function removeAvailabilityAction(resourceId: string, availabilityId: string): Promise<ActionResult<null>> {
  const t = await getTranslations("services.errors");
  const response = await serverFetch(`/resources/${resourceId}/availability/${availabilityId}`, { method: "DELETE" });
  return response.ok ? { ok: true, data: null } : fromResponse<null>(response, { default: t("availabilityRemove") });
}

export async function listUnavailabilityAction(resourceId: string): Promise<ActionResult<ResourceUnavailability[]>> {
  const t = await getTranslations("services.errors");
  const response = await serverFetch(`/resources/${resourceId}/unavailability`);
  return fromResponse<ResourceUnavailability[]>(response, { default: t("closuresLoad") });
}

export async function addUnavailabilityAction(
  resourceId: string,
  startsAt: string,
  endsAt: string,
): Promise<ActionResult<ResourceUnavailability>> {
  const t = await getTranslations("services.errors");
  const response = await serverFetch(`/resources/${resourceId}/unavailability`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ startsAt, endsAt }),
  });
  return fromResponse<ResourceUnavailability>(response, { default: t("closureAdd") });
}

export async function removeUnavailabilityAction(resourceId: string, unavailabilityId: string): Promise<ActionResult<null>> {
  const t = await getTranslations("services.errors");
  const response = await serverFetch(`/resources/${resourceId}/unavailability/${unavailabilityId}`, { method: "DELETE" });
  return response.ok ? { ok: true, data: null } : fromResponse<null>(response, { default: t("closureRemove") });
}
