"use client";

import type { ReactNode } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Progress } from "@/components/ui/progress";
import { useDashboard } from "@/components/modules/dashboard/useDashboard";
import {
  CheckInTimelineChart,
  ChannelBreakdownChart,
  GuestGrowthChart,
} from "@/components/modules/dashboard/dashboard-charts";
import { AttendanceDocuments } from "@/components/modules/dashboard/attendance-documents";
import { QuorumCard } from "@/components/modules/dashboard/quorum-card";
import { LiveBadge } from "@/components/shared";
import { billingRoute, eventGuestsRoute } from "@/lib/constants";
import type { AnalyticsData, DashboardData } from "@/components/modules/dashboard/schema";

interface EventDashboardProps {
  eventId: string;
  initial: DashboardData;
  /** Trend charts shown alongside the live snapshot; null when unavailable. */
  analytics: AnalyticsData | null;
  /**
   * Whether the event's day has come, in its own timezone: the door figures
   * matter from then on, and lead the page (JIKU-255).
   */
  dayOf: boolean;
  /** Door tools shown next to the live badge (the entrance links). */
  toolbar?: ReactNode;
}

/**
 * A published event's overview, answering one question first: where the
 * answers stand. One card says how many confirmed out of how many invited,
 * with each count leading to the matching guests; the next step shows only
 * when there is one; trend charts fold away until they have something to
 * show. The door figures appear from the event's day, and lead the page then.
 */
export function EventDashboard({ eventId, initial, analytics, dayOf, toolbar }: EventDashboardProps) {
  const t = useTranslations("events.overview");
  const format = useFormatter();
  const { data, live } = useDashboard(eventId, initial);
  const checkInPct = data.confirmed > 0 ? Math.round((data.checkedIn / data.confirmed) * 100) : 0;
  const answeredPct = data.totalGuests > 0 ? Math.round((data.confirmed / data.totalGuests) * 100) : 0;
  const guestsHref = eventGuestsRoute(eventId);
  const answerHref = (answer: string) => `${guestsHref}?answer=${answer}`;
  const unsent = data.totalGuests - data.invited;
  // Guests who never got their link come first: no answer can arrive before it does.
  const nextStep = dayOf
    ? null
    : unsent > 0
      ? { href: guestsHref, title: t("next.unsent", { count: unsent }), hint: t("next.unsentHint") }
      : data.pending > 0 && data.invited > 0
        ? { href: answerHref("PENDING"), title: t("next.pending", { count: data.pending }), hint: t("next.pendingHint") }
        : null;
  const hasTrends =
    analytics !== null &&
    (analytics.guestGrowth.length >= 2 ||
      analytics.channelBreakdown.some((channel) => channel.sent + channel.pending + channel.failed > 0));

  const responses = (
    <Card>
      <CardHeader>
        <CardDescription>{t("responses.title")}</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">
          {data.confirmed}
          <span className="ml-1 text-base font-normal text-muted-foreground">
            {t("responses.ofGuests", { count: data.totalGuests })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Progress value={answeredPct} aria-label={t("responses.title")} />
        <ul className="flex flex-wrap gap-x-1 gap-y-1 text-sm">
          <CountLink href={answerHref("CONFIRMED")} label={t("stats.confirmed")} value={data.confirmed} />
          <CountLink href={answerHref("PENDING")} label={t("stats.pending")} value={data.pending} />
          <CountLink href={answerHref("DECLINED")} label={t("stats.declined")} value={data.declined} />
        </ul>
        {data.usage ? (
          <p className="text-sm text-muted-foreground">
            {t("usage", {
              invited: data.usage.invited,
              allowance: data.usage.allowance,
              remaining: Math.max(0, data.usage.remaining),
            })}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );

  const door = (
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
      {analytics && data.checkedIn > 0 ? (
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
      <AttendanceDocuments eventId={eventId} checkedIn={data.checkedIn} />
    </section>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {live ? <LiveBadge /> : <span />}
        {toolbar}
      </div>

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

      {dayOf ? door : null}

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
      ) : (
        responses
      )}

      {nextStep ? (
        <Item variant="outline" asChild>
          <Link href={nextStep.href}>
            <ItemContent>
              <ItemTitle>{nextStep.title}</ItemTitle>
              <ItemDescription>{nextStep.hint}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <ChevronRight className="size-4" aria-hidden />
            </ItemActions>
          </Link>
        </Item>
      ) : null}

      {hasTrends && analytics ? (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="group self-start">
              {t("trends")}
              <ChevronDown className="transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none" aria-hidden />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 grid gap-4 lg:grid-cols-2">
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
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </div>
  );
}

/** One answer count, leading to the guests who gave it. */
function CountLink({ href, label, value }: { href: string; label: string; value: number }) {
  return (
    <li>
      <Link
        href={href}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 hover:bg-muted"
      >
        <span className="font-semibold tabular-nums">{value}</span>
        <span className="text-muted-foreground">{label}</span>
      </Link>
    </li>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
      {children}
    </h2>
  );
}
