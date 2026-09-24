import { getTranslations } from "next-intl/server";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventDashboard } from "@/components/modules/dashboard/event-dashboard";
import { DoorLinksDialog } from "@/components/modules/dashboard/door-links-dialog";
import { fetchAnalyticsAction } from "@/components/modules/dashboard/dashboard.service";
import { serverFetch } from "@/lib/api-server";
import { eventGuestsExportRoute } from "@/lib/constants";
import type { DashboardData } from "@/components/modules/dashboard/schema";
import { StateMessage } from "@/components/shared/state-message";

/**
 * A published event's overview: the live snapshot rendered on the server, then
 * polled from the client, with the trend charts loaded once. The event header
 * above already names the event, so this starts with the door tools.
 */
export async function DashboardView({ eventId }: { eventId: string }) {
  const [response, analyticsResult, t] = await Promise.all([
    serverFetch(`/events/${eventId}/dashboard`),
    fetchAnalyticsAction(eventId),
    getTranslations("events.overview"),
  ]);

  if (!response.ok) {
    return <StateMessage title={t("unavailable.title")} description={t("unavailable.description")} />;
  }

  const data = (await response.json()) as DashboardData;
  const analytics = analyticsResult.ok ? analyticsResult.data : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="ghost" asChild>
          <a href={eventGuestsExportRoute(eventId)} download>
            <Download data-icon="inline-start" />
            {t("exportGuests")}
          </a>
        </Button>
        <DoorLinksDialog eventId={eventId} />
      </div>
      <EventDashboard eventId={eventId} initial={data} analytics={analytics} />
    </div>
  );
}
