"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ChannelBreakdown, DateCount, TimeBucket } from "@/components/modules/dashboard/schema";

// ─── Check-in timeline ──────────────────────────────────────────────

const timelineConfig = {
  count: { label: "Check-ins", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function CheckInTimelineChart({ buckets }: { buckets: TimeBucket[] }) {
  if (buckets.length === 0) {
    return <EmptyChart message="No check-ins yet. This fills in as guests arrive." />;
  }
  return (
    <ChartContainer config={timelineConfig} className="aspect-auto h-[220px] w-full">
      <AreaChart data={buckets} margin={{ left: 12, right: 12 }}>
        <defs>
          <linearGradient id="fillCheckins" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
        <Area
          dataKey="count"
          type="natural"
          fill="url(#fillCheckins)"
          stroke="var(--color-count)"
        />
      </AreaChart>
    </ChartContainer>
  );
}

// ─── Channel breakdown ──────────────────────────────────────────────

const channelConfig = {
  sent: { label: "Sent", color: "var(--chart-1)" },
  pending: { label: "Pending", color: "var(--chart-4)" },
  failed: { label: "Failed", color: "var(--chart-5)" },
} satisfies ChartConfig;

export function ChannelBreakdownChart({ channels }: { channels: ChannelBreakdown[] }) {
  const hasData = channels.some((c) => c.sent + c.failed + c.pending > 0);
  if (!hasData) {
    return <EmptyChart message="No invitations sent yet." />;
  }
  return (
    <ChartContainer config={channelConfig} className="aspect-auto h-[220px] w-full">
      <BarChart data={channels} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="channel" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="sent" fill="var(--color-sent)" radius={4} />
        <Bar dataKey="pending" fill="var(--color-pending)" radius={4} />
        <Bar dataKey="failed" fill="var(--color-failed)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

// ─── Guest list growth (cumulative) ─────────────────────────────────

const growthConfig = {
  total: { label: "Guests imported", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function GuestGrowthChart({ daily }: { daily: DateCount[] }) {
  if (daily.length === 0) {
    return <EmptyChart message="No guests imported yet." />;
  }
  const cumulative = daily.reduce<{ date: string; total: number }[]>(
    (acc, d) => [...acc, { date: d.date, total: (acc.at(-1)?.total ?? 0) + d.count }],
    [],
  );
  // A single point can't draw an area (no width to fill) and renders as an
  // invisible flat line. Prepending a zero point makes the chart always show a
  // visible ramp, and reads correctly as "growth from zero" either way.
  const withStart =
    cumulative.length === 1 ? [{ date: "", total: 0 }, ...cumulative] : cumulative;
  return (
    <ChartContainer config={growthConfig} className="aspect-auto h-[220px] w-full">
      <AreaChart data={withStart} margin={{ left: 12, right: 12 }}>
        <defs>
          <linearGradient id="fillGrowth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
        <Area
          dataKey="total"
          type="natural"
          fill="url(#fillGrowth)"
          stroke="var(--color-total)"
        />
      </AreaChart>
    </ChartContainer>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
