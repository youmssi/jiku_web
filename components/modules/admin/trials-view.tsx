"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocalDateTime } from "@/components/shared";
import { ArrowUpDown, Gift, Timer } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableFeatures } from "@/components/ui/data-table-features";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Stat } from "@/components/shared";
import { ADMIN_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ActionDialog } from "./action-dialog";
import { endTrialAction } from "./admin.service";
import { IdentityCell, TrialStatusBadge } from "./admin-ui";
import type { AdminTrial, AdminTrialPage, AdminTrialStats } from "./schema";

const TRIAL_STATUSES = ["ACTIVE", "CONVERTED", "ENDED", "EXPIRED"] as const;
type TrialStatus = (typeof TRIAL_STATUSES)[number];

/** Sentinel filter value the "Expiring ≤ 7d" toolbar chip sets on the Expires column. */
const EXPIRING_SOON_FILTER = "EXPIRING_SOON";

/** Whole days from now until `iso`; negative once the deadline has passed. */
function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

function isExpiringSoon(trial: AdminTrial): boolean {
  return trial.status === "ACTIVE" && daysUntil(trial.expiresAt) <= 7;
}

function countdownLabel(days: number, t: ReturnType<typeof useTranslations<"admin.trials">>): string {
  if (days < 0) return t("overdue");
  if (days === 0) return t("expiresToday");
  if (days === 1) return t("expiresTomorrow");
  return t("expiresIn", { days });
}

/** How much of the trial's granted window has elapsed, 0-100. */
function runwayPercent(trial: AdminTrial): number {
  const start = new Date(trial.createdAt).getTime();
  const end = new Date(trial.expiresAt).getTime();
  if (end <= start) return 100;
  return Math.min(100, Math.max(0, ((Date.now() - start) / (end - start)) * 100));
}

function urgencyTone(days: number): "urgent" | "warn" | null {
  if (days <= 2) return "urgent";
  if (days <= 7) return "warn";
  return null;
}

function useColumns(): ColumnDef<DataTableFeatures, AdminTrial>[] {
  const t = useTranslations("admin.trials");
  const formatDate = useLocalDateTime();
  const common = useTranslations("admin.common");
  return [
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t("granted")}
        <ArrowUpDown className="size-3.5" />
      </Button>
    ),
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "tenant",
    header: t("organization"),
    enableSorting: false,
    cell: ({ row }) => (
      <IdentityCell
        name={row.original.tenantName}
        id={row.original.tenantId}
        fallbackLabel={`${row.original.tenantId.slice(0, 8)}…`}
      />
    ),
  },
  {
    id: "event",
    header: t("event"),
    enableSorting: false,
    cell: ({ row }) => (
      <IdentityCell
        name={row.original.eventName}
        id={row.original.eventId}
        fallbackLabel={`${row.original.eventId.slice(0, 8)}…`}
      />
    ),
  },
  {
    accessorKey: "grantedAllowance",
    header: t("guests"),
  },
  {
    accessorKey: "expiresAt",
    header: t("expires"),
    // Only used by the toolbar's "Expiring ≤ 7d" chip — every other value passes through.
    filterFn: (row, _columnId, filterValue) =>
      filterValue === EXPIRING_SOON_FILTER ? isExpiringSoon(row.original) : true,
    cell: ({ row }) => {
      const trial = row.original;
      if (trial.status !== "ACTIVE") {
        return <span className="text-muted-foreground">{formatDate(trial.expiresAt)}</span>;
      }
      const days = daysUntil(trial.expiresAt);
      const tone = urgencyTone(days);
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex w-32 cursor-help flex-col gap-1">
              <span
                className={cn(
                  "text-xs font-medium",
                  tone === "urgent" && "text-red-600 dark:text-red-400",
                  tone === "warn" && "text-amber-600 dark:text-amber-500",
                )}
              >
                {countdownLabel(days, t)}
              </span>
              <Progress
                value={runwayPercent(trial)}
                className={cn(
                  "h-1",
                  tone === "urgent" && "*:data-[slot=progress-indicator]:bg-red-500",
                  tone === "warn" && "*:data-[slot=progress-indicator]:bg-amber-500",
                )}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>{t("expiresOn", { date: formatDate(trial.expiresAt) })}</TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "status",
    header: common("status"),
    filterFn: "includesString",
    cell: ({ row }) => <TrialStatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: common("actions"),
    enableSorting: false,
    cell: ({ row }) =>
      row.original.status === "ACTIVE" ? (
        <ActionDialog
          trigger={t("endEarly")}
          title={t("endTitle")}
          description={t("endText")}
          fieldLabel={t("reason")}
          confirmLabel={t("endConfirm")}
          destructive
          onConfirm={(reason) => endTrialAction(row.original.id, reason)}
        />
      ) : (
        <span className="text-muted-foreground">
          {row.original.endedReason ?? "—"}
        </span>
      ),
  },
];
}

export function TrialsView({
  trialsPage,
  stats,
}: {
  trialsPage: AdminTrialPage;
  stats: AdminTrialStats;
}) {
  const t = useTranslations("admin.trials");
  const columns = useColumns();
  const { entries: trials } = trialsPage;

  return (
    <div className="flex flex-col gap-6">
      <TrialsOverview stats={stats} />

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{t("intro")}</p>
        <Button asChild>
          <Link href={ADMIN_ROUTES.GIFTS}>
            <Gift className="size-3.5" data-icon="inline-start" />
            {t("offerGift")}
          </Link>
        </Button>
      </div>

      {trials.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Timer />
            </EmptyMedia>
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyText")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={trials}
            pageSize={trialsPage.size}
            toolbar={(table) => <TrialsToolbar table={table} />}
          />
          <TrialsPager page={trialsPage.page} size={trialsPage.size} total={trialsPage.total} />
        </>
      )}
    </div>
  );
}

/**
 * The overview strip: what an admin working the trial funnel needs to see
 * before reading a single row — what's active, what's about to lapse, and how
 * the funnel is converting overall.
 */
function TrialsOverview({ stats }: { stats: AdminTrialStats }) {
  const t = useTranslations("admin.trials.stats");
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label={t("active")} value={stats.active} />
      <Stat
        label={t("expiring")}
        value={stats.expiringWithin7Days}
        tone={stats.expiringWithin7Days > 0 ? "urgent" : "default"}
      />
      <Stat label={t("converted")} value={stats.convertedThisMonth} tone="positive" />
      <Stat
        label={t("rate")}
        value={stats.conversionRatePercent === null ? "—" : `${Math.round(stats.conversionRatePercent)}%`}
      />
    </div>
  );
}

function TrialsPager({ page, size, total }: { page: number; size: number; total: number }) {
  const t = useTranslations("admin.trials");
  const pageCount = Math.max(1, Math.ceil(total / size));
  if (pageCount <= 1) {
    return (
      <p className="text-xs text-muted-foreground">
        {t("showingAll", { count: total })}
      </p>
    );
  }
  const hasPrevious = page > 0;
  const hasNext = page + 1 < pageCount;
  const rangeStart = page * size + 1;
  const rangeEnd = Math.min(total, (page + 1) * size);

  return (
    <nav aria-label={t("pagination")} className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">
        {t("showing", { start: rangeStart, end: rangeEnd, total })}
      </span>
      <div className="flex items-center gap-2">
        {hasPrevious ? (
          <Button asChild variant="outline" size="sm">
            <Link href={`${ADMIN_ROUTES.TRIALS}?page=${page - 1}`}>{t("previous")}</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            {t("previous")}
          </Button>
        )}
        <span className="text-xs text-muted-foreground">
          {t("page", { page: page + 1, count: pageCount })}
        </span>
        {hasNext ? (
          <Button asChild variant="outline" size="sm">
            <Link href={`${ADMIN_ROUTES.TRIALS}?page=${page + 1}`}>{t("next")}</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            {t("next")}
          </Button>
        )}
      </div>
    </nav>
  );
}

/**
 * Client-side filters of the trials table: the page is not server-filtered
 * beyond pagination, so the table owns status and urgency filtering
 * within the current page, like the organizer's data tables.
 */
function TrialsToolbar({
  table,
}: {
  table: import("@tanstack/react-table").Table<DataTableFeatures, AdminTrial>;
}) {
  const t = useTranslations("admin.trials");
  const statusLabel = useTranslations("admin.trialStatus");
  const [status, setStatus] = useState<TrialStatus | "ALL">("ALL");
  const [expiringOnly, setExpiringOnly] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2 py-4">
      <Combobox<TrialStatus>
        value={status === "ALL" ? null : status}
        onValueChange={(next) => {
          setStatus(next ?? "ALL");
          table.getColumn("status")?.setFilterValue(next ?? "");
        }}
        items={TRIAL_STATUSES}
        itemKey={(value) => value}
        itemLabel={(value) => statusLabel(value)}
        placeholder={t("allStatuses")}
        searchPlaceholder={t("status")}
        emptyMessage={t("noStatus")}
        className="w-44"
      />
      <Button
        type="button"
        size="sm"
        variant={expiringOnly ? "default" : "outline"}
        className="rounded-full"
        onClick={() => {
          const next = !expiringOnly;
          setExpiringOnly(next);
          table.getColumn("expiresAt")?.setFilterValue(next ? EXPIRING_SOON_FILTER : undefined);
        }}
      >
        {t("expiringChip")}
      </Button>
    </div>
  );
}
