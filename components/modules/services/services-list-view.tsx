import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { serverFetch } from "@/lib/api-server";
import { serviceLineRoute } from "@/lib/constants";
import type { ServiceSummary } from "@/components/modules/services/schema";

/**
 * Services de l'organisateur : chaque service ouvre sa ligne du jour, l'écran du
 * comptoir (JIKU-88). Liste en lecture seule — la gestion du service appartient à
 * un écran dédié.
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
                <Button asChild>
                  <Link href={serviceLineRoute(service.id)}>Ligne du jour</Link>
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
