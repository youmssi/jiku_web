import { serverFetch } from "@/lib/api-server";
import { ServiceManagePanel } from "@/components/modules/services/service-manage-panel";
import type {
  ServiceRequirement,
  ServiceResource,
  ServiceSummary,
  StaffLink,
} from "@/components/modules/services/schema";

/**
 * Vue serveur de la gestion d'un service : service + listes initiales (ressources,
 * exigences, personnel) chargées en une passe, puis panneau interactif.
 */
export async function ServiceManageView({ serviceId }: { serviceId: string }) {
  const [serviceRes, resourcesRes, requirementsRes, staffRes] = await Promise.all([
    serverFetch(`/services/${serviceId}`),
    serverFetch("/resources"),
    serverFetch(`/services/${serviceId}/requirements`),
    serverFetch(`/services/${serviceId}/staff-links`),
  ]);

  if (!serviceRes.ok) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <p className="text-muted-foreground">
          {serviceRes.status === 404
            ? "Ce service est introuvable ou ne vous appartient pas."
            : "Impossible de charger ce service."}
        </p>
      </div>
    );
  }

  const service = (await serviceRes.json()) as ServiceSummary;
  const resources: ServiceResource[] = resourcesRes.ok ? ((await resourcesRes.json()) as ServiceResource[]) : [];
  const requirements: ServiceRequirement[] = requirementsRes.ok
    ? ((await requirementsRes.json()) as ServiceRequirement[])
    : [];
  const staff: StaffLink[] = staffRes.ok ? ((await staffRes.json()) as StaffLink[]) : [];

  return (
    <ServiceManagePanel
      service={service}
      initialResources={resources}
      initialRequirements={requirements}
      initialStaffLinks={staff}
    />
  );
}
