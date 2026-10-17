import { getTranslations } from "next-intl/server";
import { EventDashboard } from "@/components/modules/dashboard/event-dashboard";
import { DoorLinksDialog } from "@/components/modules/dashboard/door-links-dialog";
import { fetchAnalyticsAction } from "@/components/modules/dashboard/dashboard.service";
import { serverFetch } from "@/lib/api-server";
import type { DashboardData } from "@/components/modules/dashboard/schema";
import { StateMessage } from "@/components/shared/state-message";

/**
 * A published event's overview: the live snapshot rendered on the server, then
 * polled from the client, with the trend charts loaded once. Exporting the
 * guest list lives in the event header's menu; the entrance links stay here.
 */
export async function DashboardView({
  eventId,
  startDateTime,
  timezone,
}: {
  eventId: string;
  /** The event's start, to tell whether its day has come (JIKU-255). */
  startDateTime: string | null;
  timezone: string;
}) {
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
    <EventDashboard
      eventId={eventId}
      initial={data}
      analytics={analytics}
      dayOf={hasDayCome(startDateTime, timezone)}
      toolbar={<DoorLinksDialog eventId={eventId} />}
    />
  );
}

/** Whether today, in the event's timezone, is its day or later. */
function hasDayCome(startDateTime: string | null, timezone: string): boolean {
  if (!startDateTime) return false;
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, dateStyle: "short" });
  return day.format(new Date()) >= day.format(new Date(startDateTime));
}
