import { Scissors } from "lucide-react";
import { getTranslations } from "next-intl/server";
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
  const t = await getTranslations("services.list");
  const response = await serverFetch("/services");
  const services: ServiceSummary[] = response.ok
    ? ((await response.json()) as ServiceSummary[])
    : [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <CreateServiceButton />
      </div>

      {services.length === 0 ? (
        <Empty className="mt-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Scissors />
            </EmptyMedia>
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyText")}</EmptyDescription>
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
