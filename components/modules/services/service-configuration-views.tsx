import { serverFetch } from "@/lib/api-server";
import { loadSmsAvailable } from "@/lib/sms-available";
import { fetchServiceConfigurationAction } from "@/components/modules/services/services.service";
import type { ServiceSummary } from "@/components/modules/services/schema";
import { ServiceConfigurationPanel } from "@/components/modules/services/service-configuration-view";

/**
 * A service's settings (JIKU-89, JIKU-252): its length and price, then group
 * sessions and reminders, loaded on the server and edited on the client.
 */
export async function ServiceConfigurationView({ serviceId }: { serviceId: string }) {
  const [result, serviceRes, profileRes, smsAvailable] = await Promise.all([
    fetchServiceConfigurationAction(serviceId),
    serverFetch(`/services/${serviceId}`),
    serverFetch("/orgs/profile"),
    loadSmsAvailable(),
  ]);

  if (!result.ok || !serviceRes.ok) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <p className="text-muted-foreground">{result.ok ? null : result.error}</p>
      </div>
    );
  }

  const service = (await serviceRes.json()) as ServiceSummary;
  const currency = profileRes.ok ? (((await profileRes.json()) as { currency?: string | null }).currency ?? null) : null;
  return <ServiceConfigurationPanel service={service} currency={currency} initial={result.data} smsAvailable={smsAvailable} />;
}
