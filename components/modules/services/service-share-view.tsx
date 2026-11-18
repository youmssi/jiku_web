import { getLocale, getTranslations } from "next-intl/server";
import { serverFetch } from "@/lib/api-server";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/components/modules/seo";
import { serviceCardLink } from "@/components/modules/appointment";
import { ServiceSharePanel } from "@/components/modules/services/service-share-panel";
import type { ServiceShare, ServiceSummary } from "@/components/modules/services/schema";

/**
 * A service's Share tab (JIKU-189): its card to post in WhatsApp groups and
 * statuses, the link to paste, and how many visitors and bookings came through
 * each over the last days. A card leads to one service; nothing is sent by Jikū.
 */
export async function ServiceShareView({ serviceId }: { serviceId: string }) {
  const [serviceRes, shareRes] = await Promise.all([serverFetch(`/services/${serviceId}`), serverFetch(`/services/${serviceId}/share`)]);
  if (!serviceRes.ok || !shareRes.ok) {
    const t = await getTranslations("services.manage");
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <p className="text-muted-foreground">{serviceRes.status === 404 ? t("notFound") : t("loadFailed")}</p>
      </div>
    );
  }
  const [service, share, locale] = await Promise.all([
    serviceRes.json() as Promise<ServiceSummary>,
    shareRes.json() as Promise<ServiceShare>,
    getLocale(),
  ]);
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const base = `${siteUrl()}${prefix}`;
  return (
    <ServiceSharePanel
      serviceId={serviceId}
      serviceName={service.name}
      place={service.place ?? ""}
      share={share}
      links={{
        PRESENTATION: serviceCardLink(base, share.code, "link", "PRESENTATION"),
        SLOT: serviceCardLink(base, share.code, "link", "SLOT"),
      }}
      cardUrl={`/api/service-cards/${encodeURIComponent(share.code)}?format=portrait&lang=${locale}`}
    />
  );
}
