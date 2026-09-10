import { Scissors } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { serverFetch } from "@/lib/api-server";
import { CreateServiceButton } from "@/components/modules/services/create-service-button";
import { ServicesTable } from "@/components/modules/services/services-table";
import type { ServiceSummary } from "@/components/modules/services/schema";

/**
 * Services de l'organisateur : chaque service ouvre sa ligne du jour (JIKU-88)
 * et sa configuration (JIKU-89). Liste en data-table avec état vide.
 */
export async function ServicesListView() {
  const response = await serverFetch("/services");
  const services: ServiceSummary[] = response.ok
    ? ((await response.json()) as ServiceSummary[])
    : [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Services</h1>
        <CreateServiceButton />
      </div>

      {services.length === 0 ? (
        <Empty className="mt-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Scissors />
            </EmptyMedia>
            <EmptyTitle>Aucun service</EmptyTitle>
            <EmptyDescription>
              Créez un service pour ouvrir sa ligne du jour et partager son lien de réservation.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateServiceButton />
          </EmptyContent>
        </Empty>
      ) : (
        <div className="mt-6">
          <ServicesTable services={services} />
        </div>
      )}
    </div>
  );
}
