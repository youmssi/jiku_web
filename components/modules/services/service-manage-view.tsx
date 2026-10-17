import { getTranslations } from "next-intl/server";
import { serverFetch } from "@/lib/api-server";
import { siteUrl } from "@/components/modules/seo";
import { ServiceManagePanel } from "@/components/modules/services/service-manage-panel";
import type {
  ResourceAvailability,
  ServiceConfiguration,
  ServiceRequirement,
  ServiceResource,
  ServiceSummary,
  StaffLink,
} from "@/components/modules/services/schema";

async function readJson<T>(response: Response, fallback: T): Promise<T> {
  return response.ok ? ((await response.json()) as T) : fallback;
}

/**
 * A service's link and hours page (JIKU-252), loaded in one pass: the booking
 * link ready to share, the length of an appointment, each person's week, then
 * the rarer settings the panel folds away.
 */
export async function ServiceManageView({ serviceId }: { serviceId: string }) {
  const [serviceRes, resourcesRes, requirementsRes, staffRes, linkRes, configRes] = await Promise.all([
    serverFetch(`/services/${serviceId}`),
    serverFetch("/resources"),
    serverFetch(`/services/${serviceId}/requirements`),
    serverFetch(`/services/${serviceId}/staff-links`),
    serverFetch(`/services/${serviceId}/booking-link`),
    serverFetch(`/services/${serviceId}/configuration`),
  ]);

  if (!serviceRes.ok) {
    const t = await getTranslations("services.manage");
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <p className="text-muted-foreground">
          {serviceRes.status === 404 ? t("notFound") : t("loadFailed")}
        </p>
      </div>
    );
  }

  const service = (await serviceRes.json()) as ServiceSummary;
  const resources = await readJson<ServiceResource[]>(resourcesRes, []);
  const requirements = await readJson<ServiceRequirement[]>(requirementsRes, []);
  const staff = await readJson<StaffLink[]>(staffRes, []);
  const link = await readJson<{ shortCode: string } | null>(linkRes, null);
  const config = await readJson<ServiceConfiguration | null>(configRes, null);
  const people = resources.filter((resource) => resource.type === "PERSON" && resource.active);
  const weeks = Object.fromEntries(
    await Promise.all(
      people.map(async (person) => [
        person.id,
        await readJson<ResourceAvailability[]>(await serverFetch(`/resources/${person.id}/availability`), []),
      ]),
    ),
  ) as Record<string, ResourceAvailability[]>;

  return (
    <ServiceManagePanel
      service={service}
      bookingUrl={link ? `${siteUrl()}/r/${link.shortCode}` : null}
      durationMinutes={config?.durationMinutes ?? null}
      weeks={weeks}
      initialResources={resources}
      initialRequirements={requirements}
      initialStaffLinks={staff}
    />
  );
}
