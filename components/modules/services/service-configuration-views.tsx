import { fetchServiceConfigurationAction } from "@/components/modules/services/services.service";
import { ServiceConfigurationPanel } from "@/components/modules/services/service-configuration-view";

/**
 * Écran de configuration d'un service (JIKU-89) : chargement côté serveur de la
 * configuration effective, puis panneau d'édition des rappels côté client.
 */
export async function ServiceConfigurationView({ serviceId }: { serviceId: string }) {
  const result = await fetchServiceConfigurationAction(serviceId);

  if (!result.ok) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <p className="text-muted-foreground">{result.error}</p>
      </div>
    );
  }

  return <ServiceConfigurationPanel serviceId={serviceId} initial={result.data} />;
}
