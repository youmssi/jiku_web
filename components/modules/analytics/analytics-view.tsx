import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EventSubNav } from "@/components/shared/event-sub-nav";
import { StateMessage } from "@/components/shared/state-message";
import { fetchAnalyticsAction } from "@/components/modules/analytics/analytics.service";
import {
  ChannelBreakdownChart,
  CheckInTimelineChart,
  GuestGrowthChart,
  RsvpFunnelChart,
} from "@/components/modules/analytics/analytics-charts";
import { serverFetch } from "@/lib/api-server";
import type { DashboardData } from "@/components/modules/dashboard/schema";

/** Detailed, decision-oriented analytics for one event: trends, not the live snapshot (see DashboardView for that). */
export async function AnalyticsView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [analyticsResult, dashboardResponse] = await Promise.all([
    fetchAnalyticsAction(id),
    serverFetch(`/events/${id}/dashboard`),
  ]);

  if (!analyticsResult.ok || !dashboardResponse.ok) {
    return (
      <StateMessage
        title="Analytics unavailable"
        description="We couldn't load this event's analytics. Please try again."
      />
    );
  }

  const analytics = analyticsResult.data;
  const dashboard = (await dashboardResponse.json()) as DashboardData;
  const totalSent = analytics.channelBreakdown.reduce((sum, c) => sum + c.sent, 0);
  const totalFailed = analytics.channelBreakdown.reduce((sum, c) => sum + c.failed, 0);
  const checkInRate =
    dashboard.confirmed > 0 ? Math.round((dashboard.checkedIn / dashboard.confirmed) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{dashboard.eventName}</h1>
          <Badge variant="secondary">{dashboard.eventStatus}</Badge>
        </div>
      </div>

      <div className="mt-6">
        <EventSubNav eventId={id} />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryStat label="Total guests" value={dashboard.totalGuests} />
        <SummaryStat label="Invitations sent" value={totalSent} tone={totalFailed > 0 ? "warn" : "default"} />
        <SummaryStat label="Checked in" value={`${dashboard.checkedIn} (${checkInRate}%)`} tone="positive" />
        <SummaryStat label="Delivery failures" value={totalFailed} tone={totalFailed > 0 ? "warn" : "default"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Check-in timeline</CardTitle>
            <CardDescription>Arrivals by hour, in the event&apos;s own timezone.</CardDescription>
          </CardHeader>
          <CardContent>
            <CheckInTimelineChart buckets={analytics.checkInTimeline} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>RSVP breakdown</CardTitle>
            <CardDescription>Confirmed, declined and awaiting response.</CardDescription>
          </CardHeader>
          <CardContent>
            <RsvpFunnelChart
              confirmed={dashboard.confirmed}
              declined={dashboard.declined}
              pending={dashboard.pending}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery by channel</CardTitle>
            <CardDescription>Email and WhatsApp, sent vs. pending vs. failed.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChannelBreakdownChart channels={analytics.channelBreakdown} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guest list growth</CardTitle>
            <CardDescription>Cumulative guests imported ahead of the event.</CardDescription>
          </CardHeader>
          <CardContent>
            <GuestGrowthChart daily={analytics.guestGrowth} />
          </CardContent>
        </Card>

        {dashboard.entrances.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Check-ins by entrance</CardTitle>
              <CardDescription>Which checkpoint let each guest in.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {dashboard.entrances.map((entrance) => (
                  <li key={entrance.label} className="flex items-center justify-between py-2 text-sm">
                    <span>{entrance.label}</span>
                    <span className="font-medium">{entrance.checkedIn}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "positive" | "warn";
}) {
  const valueClass =
    tone === "positive"
      ? "text-green-600 dark:text-green-400"
      : tone === "warn"
        ? "text-amber-600 dark:text-amber-400"
        : "";
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}
