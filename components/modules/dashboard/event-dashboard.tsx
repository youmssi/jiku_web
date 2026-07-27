"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/components/modules/dashboard/useDashboard";
import {
  CheckInTimelineChart,
  ChannelBreakdownChart,
  GuestGrowthChart,
} from "@/components/modules/dashboard/dashboard-charts";
import type { AnalyticsData, DashboardData } from "@/components/modules/dashboard/schema";

interface EventDashboardProps {
  eventId: string;
  initial: DashboardData;
  /** Trend charts shown alongside the live snapshot; null when unavailable. */
  analytics: AnalyticsData | null;
}

/**
 * Event overview: one page combining the live snapshot (polled client-side) with
 * trend charts (fetched once at load), so an organizer doesn't have to choose
 * between "what's happening now" and "how did we get here." Pre-event metrics
 * and the day-of check-in metric each keep their own section since they matter
 * to the organizer at different times.
 */
export function EventDashboard({ eventId, initial, analytics }: EventDashboardProps) {
  const { data, updatedAt } = useDashboard(eventId, initial);
  const checkInPct =
    data.confirmed > 0 ? Math.round((data.checkedIn / data.confirmed) * 100) : 0;

  return (
    <div className="flex flex-col gap-8">
      {data.deliverability.warn ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <p className="font-medium">Some invitations aren&apos;t being delivered</p>
          <p className="mt-1">
            About {data.deliverability.bounceRatePercent}% of your recent emails bounced.
            Check your imported email addresses. Repeated bounces can hurt delivery for
            everyone.
          </p>
        </div>
      ) : null}

      {data.dataRetention ? (
        <div className="rounded-xl border border-blue-300 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200">
          <p className="font-medium">Guest data will be anonymized soon</p>
          <p className="mt-1">
            Under the retention policy, this event&apos;s guest personal data (names,
            emails, phone numbers) will be anonymized on{" "}
            {new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(
              new Date(data.dataRetention.anonymizeOn),
            )}
            . Your attendance totals are kept.
          </p>
        </div>
      ) : null}

      {data.usage && !data.usage.withinAllowance ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <p className="font-medium">You&apos;ve reached this event&apos;s guest allowance</p>
          <p className="mt-1">
            {data.usage.invited} of {data.usage.allowance} invitations used on the{" "}
            {data.usage.tier.toLowerCase()} tier. Upgrade to invite more guests.
          </p>
        </div>
      ) : null}

      <section>
        <SectionHeading>Before the event</SectionHeading>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Stat label="Total guests" value={data.totalGuests} />
          <Stat label="Invited" value={data.invited} />
          <Stat label="Confirmed" value={data.confirmed} tone="positive" />
          <Stat label="Declined" value={data.declined} />
          <Stat label="No response" value={data.pending} tone="muted" />
        </div>
        {data.usage ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {data.usage.invited} of {data.usage.allowance} invitations used
            {data.usage.remaining > 0
              ? `, ${data.usage.remaining} remaining on the ${data.usage.tier.toLowerCase()} tier`
              : ` on the ${data.usage.tier.toLowerCase()} tier`}
            .
          </p>
        ) : null}
        {analytics ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Guest list growth</CardTitle>
                <CardDescription>Cumulative guests imported ahead of the event.</CardDescription>
              </CardHeader>
              <CardContent>
                <GuestGrowthChart daily={analytics.guestGrowth} />
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
          </div>
        ) : null}
      </section>

      <section>
        <SectionHeading>On the day</SectionHeading>
        <div className="rounded-xl border p-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Checked in</p>
              <p className="mt-1 text-3xl font-semibold">
                {data.checkedIn}
                <span className="ml-1 text-base font-normal text-muted-foreground">
                  / {data.confirmed} confirmed
                </span>
              </p>
            </div>
            <span className="text-2xl font-semibold text-muted-foreground">{checkInPct}%</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-green-600 transition-all"
              style={{ width: `${checkInPct}%` }}
            />
          </div>

          <div className="mt-5">
            <p className="text-sm font-medium">By entrance</p>
            {data.entrances.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No validator links yet. Create one from the event to staff check-in.
              </p>
            ) : (
              <ul className="mt-2 divide-y">
                {data.entrances.map((entrance) => (
                  <li
                    key={entrance.label}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <span>{entrance.label}</span>
                    <span className="font-medium">{entrance.checkedIn}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {analytics ? (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Check-in timeline</CardTitle>
              <CardDescription>Arrivals by hour, in the event&apos;s own timezone.</CardDescription>
            </CardHeader>
            <CardContent>
              <CheckInTimelineChart buckets={analytics.checkInTimeline} />
            </CardContent>
          </Card>
        ) : null}
      </section>

      <p className="text-xs text-muted-foreground">
        {updatedAt ? "Updating live every few seconds." : "Live updates on."}
      </p>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "positive" | "muted";
}) {
  const valueClass =
    tone === "positive"
      ? "text-green-600 dark:text-green-400"
      : tone === "muted"
        ? "text-muted-foreground"
        : "";
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}
