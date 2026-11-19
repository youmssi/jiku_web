import { serverFetch } from "@/lib/api-server";
import { loadSmsAvailable } from "@/lib/sms-available";
import { fetchServiceConfigurationAction, fetchServiceQuestions, listServices } from "@/components/modules/services/services.service";
import { ServiceQuestionsEditor } from "@/components/modules/services/service-questions-editor";
import type { ServiceSummary } from "@/components/modules/services/schema";
import { ServiceConfigurationPanel } from "@/components/modules/services/service-configuration-view";

/**
 * A service's settings (JIKU-89, JIKU-252): its length and price, then group
 * sessions and reminders, then the questions asked before the times (JIKU-191),
 * loaded on the server and edited on the client.
 */
export async function ServiceConfigurationView({ serviceId }: { serviceId: string }) {
  const [result, serviceRes, profileRes, smsAvailable, questions, services] = await Promise.all([
    fetchServiceConfigurationAction(serviceId),
    serverFetch(`/services/${serviceId}`),
    serverFetch("/orgs/profile"),
    loadSmsAvailable(),
    fetchServiceQuestions(serviceId),
    listServices(),
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
  return (
    <>
      <ServiceConfigurationPanel service={service} currency={currency} initial={result.data} smsAvailable={smsAvailable} />
      <div className="mx-auto w-full max-w-3xl px-4 pb-10">
        <ServiceQuestionsEditor
          serviceId={serviceId}
          initial={questions.ok ? questions.data : []}
          otherServices={services.filter((other) => other.id !== serviceId).map(({ id, name }) => ({ id, name }))}
        />
      </div>
    </>
  );
}
