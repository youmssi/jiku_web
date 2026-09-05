import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { serverFetch } from "@/lib/api-server";
import { serviceConfigurationRoute, serviceLineRoute } from "@/lib/constants";
import type { ServiceSummary } from "@/components/modules/services/schema";

/**
 * Services de l'organisateur : chaque service ouvre sa ligne du jour (JIKU-88) et
 * sa configuration (JIKU-89). Liste en lecture seule.
 */
export async function ServicesListView() {
  const response = await serverFetch("/services");
  const services: ServiceSummary[] = response.ok ? ((await response.json()) as ServiceSummary[]) : [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Services</h1>

      {services.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          Aucun service pour le moment. Créez un service pour ouvrir sa ligne du jour.
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base">{service.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{service.timezone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline">
                    <Link href={serviceConfigurationRoute(service.id)}>Configuration</Link>
                  </Button>
                  <Button asChild>
                    <Link href={serviceLineRoute(service.id)}>Ligne du jour</Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
