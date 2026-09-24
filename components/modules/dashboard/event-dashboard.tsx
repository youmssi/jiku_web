"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { useDashboard } from "@/components/modules/dashboard/useDashboard";
import {
  CheckInTimelineChart,
  ChannelBreakdownChart,
  GuestGrowthChart,
} from "@/components/modules/dashboard/dashboard-charts";
import { AttendanceDocuments } from "@/components/modules/dashboard/attendance-documents";
import { QuorumCard } from "@/components/modules/dashboard/quorum-card";
import { Stat } from "@/components/shared";
import { billingRoute, eventGuestsRoute } from "@/lib/constants";
import type { AnalyticsData, DashboardData } from "@/components/modules/dashboard/schema";

interface EventDashboardProps {
  eventId: string;
  initial: DashboardData;
  /** Trend charts shown alongside the live snapshot; null when unavailable. */
  analytics: AnalyticsData | null;
}

/**
 * A published event's overview: the live snapshot (polled client-side) next to
 * the trend charts (fetched once), so an organizer doesn't have to choose
 * between "what's happening now" and "how did we get here." What matters before
 * the event and on the day each get their own section.
 */
export function EventDashboard({ eventId, initial, analytics }: EventDashboardProps) {
  const t = useTranslations("events.overview");
  const format = useFormatter();
  const { data } = useDashboard(eventId, initial);
  const checkInPct = data.confirmed > 0 ? Math.round((data.checkedIn / data.confirmed) * 100) : 0;
  const guestsHref = eventGuestsRoute(eventId);

  return (
    <div className="flex flex-col gap-8">
      {data.deliverability.warn ? (
        <Alert>
          <AlertTitle>{t("alerts.bounces.title")}</AlertTitle>
          <AlertDescription>
            {t("alerts.bounces.description", { percent: data.deliverability.bounceRatePercent })}
          </AlertDescription>
        </Alert>
      ) : null}

      {data.dataRetention ? (
        <Alert>
          <AlertTitle>{t("alerts.retention.title")}</AlertTitle>
          <AlertDescription>
            {t("alerts.retention.description", {
              date: format.dateTime(new Date(data.dataRetention.anonymizeOn), { dateStyle: "long" }),
            })}
          </AlertDescription>
        </Alert>
      ) : null}

      {data.usage && !data.usage.withinAllowance ? (
        <Alert>
          <AlertTitle>{t("alerts.allowance.title")}</AlertTitle>
          <AlertDescription>
            {t("alerts.allowance.description", { invited: data.usage.invited, allowance: data.usage.allowance })}
            <Button asChild size="sm" variant="outline" className="mt-2 w-fit">
              <Link href={billingRoute(eventId)}>{t("alerts.allowance.cta")}</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {data.quorum ? <QuorumCard quorum={data.quorum} /> : null}

      <section aria-labelledby="before-title" className="flex flex-col gap-3">
        <SectionHeading id="before-title">{t("before")}</SectionHeading>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Stat label={t("stats.total")} value={data.totalGuests} href={guestsHref} />
          <Stat label={t("stats.invited")} value={data.invited} href={guestsHref} />
          <Stat label={t("stats.confirmed")} value={data.confirmed} tone="positive" href={guestsHref} />
          <Stat label={t("stats.declined")} value={data.declined} href={guestsHref} />
          <Stat label={t("stats.pending")} value={data.pending} tone="muted" href={guestsHref} />
        </div>
        {data.totalGuests === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>{t("noGuests.title")}</EmptyTitle>
              <EmptyDescription>{t("noGuests.description")}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild size="sm">
                <Link href={guestsHref}>{t("noGuests.cta")}</Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : null}
        {data.usage ? (
          <p className="text-sm text-muted-foreground">
            {t("usage", {
              invited: data.usage.invited,
              allowance: data.usage.allowance,
              remaining: Math.max(0, data.usage.remaining),
            })}
          </p>
        ) : null}
        {analytics ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("growth.title")}</CardTitle>
                <CardDescription>{t("growth.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <GuestGrowthChart daily={analytics.guestGrowth} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("delivery.title")}</CardTitle>
                <CardDescription>{t("delivery.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ChannelBreakdownChart channels={analytics.channelBreakdown} />
              </CardContent>
            </Card>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="day-title" className="flex flex-col gap-3">
        <SectionHeading id="day-title">{t("onTheDay")}</SectionHeading>
        <Card>
          <CardHeader>
            <CardDescription>{t("checkedIn")}</CardDescription>
            <CardTitle className="flex items-baseline justify-between gap-4">
              <span className="text-3xl font-semibold tabular-nums">
                {data.checkedIn}
                <span className="ml-1 text-base font-normal text-muted-foreground">
                  {t("ofConfirmed", { confirmed: data.confirmed })}
                </span>
              </span>
              <span className="text-2xl font-semibold text-muted-foreground tabular-nums">
                {format.number(checkInPct / 100, { style: "percent" })}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <Progress value={checkInPct} aria-label={t("checkedIn")} />
            <div>
              <p className="text-sm font-medium">{t("byEntrance")}</p>
              {data.entrances.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">{t("noEntrances")}</p>
              ) : (
                <ul className="mt-2 divide-y">
                  {data.entrances.map((entrance) => (
                    <li key={entrance.label} className="flex items-center justify-between py-2 text-sm">
                      <span>{entrance.label}</span>
                      <span className="font-medium tabular-nums">{entrance.checkedIn}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        {analytics ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("timeline.title")}</CardTitle>
              <CardDescription>{t("timeline.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <CheckInTimelineChart buckets={analytics.checkInTimeline} />
            </CardContent>
          </Card>
        ) : null}
      </section>

      <AttendanceDocuments eventId={eventId} checkedIn={data.checkedIn} />

      <p className="text-xs text-muted-foreground">{t("live")}</p>
    </div>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
      {children}
    </h2>
  );
}
