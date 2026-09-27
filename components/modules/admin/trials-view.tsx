"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ArrowUpDown, Plus, Timer } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableFeatures } from "@/components/ui/data-table-features";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FormFieldError, Stat } from "@/components/shared";
import { ADMIN_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { formatLocalDateTime } from "@/lib/datetime";
import { ActionDialog } from "./action-dialog";
import { endTrialAction, grantTrialAction } from "./admin.service";
import { formatAmount, IdentityCell, TrialStatusBadge } from "./admin-ui";
import { TenantCombobox } from "./tenant-combobox";
import { EventCombobox } from "./event-combobox";
import {
  grantTrialSchema,
  type AdminTierCatalog,
  type AdminTrial,
  type AdminTrialPage,
  type AdminTrialStats,
  type GrantTrialFormValues,
} from "./schema";

const TRIAL_STATUSES = ["ACTIVE", "CONVERTED", "ENDED", "EXPIRED"] as const;

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
    cell: ({ row }) => formatLocalDateTime(row.original.createdAt),
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
    accessorKey: "tier",
    header: t("tier"),
    filterFn: "includesString",
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
        return <span className="text-muted-foreground">{formatLocalDateTime(trial.expiresAt)}</span>;
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
          <TooltipContent>{t("expiresOn", { date: formatLocalDateTime(trial.expiresAt) })}</TooltipContent>
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
  catalog,
}: {
  trialsPage: AdminTrialPage;
  stats: AdminTrialStats;
  catalog: AdminTierCatalog;
}) {
  const t = useTranslations("admin.trials");
  const columns = useColumns();
  const { entries: trials } = trialsPage;

  return (
    <div className="flex flex-col gap-6">
      <TrialsOverview stats={stats} />

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{t("intro")}</p>
        <GrantTrialDialog catalog={catalog} />
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
            toolbar={(table) => <TrialsToolbar table={table} catalog={catalog} />}
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
 * beyond pagination, so the table owns status, tier and urgency filtering
 * within the current page, like the organizer's data tables.
 */
function TrialsToolbar({
  table,
  catalog,
}: {
  table: import("@tanstack/react-table").Table<DataTableFeatures, AdminTrial>;
  catalog: AdminTierCatalog;
}) {
  const t = useTranslations("admin.trials");
  const statusLabel = useTranslations("admin.trialStatus");
  const [status, setStatus] = useState("ALL");
  const [expiringOnly, setExpiringOnly] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2 py-4">
      <Combobox
        value={status}
        onValueChange={(value) => {
          const next = typeof value === "string" ? value : "ALL";
          setStatus(next);
          table
            .getColumn("status")
            ?.setFilterValue(next === "ALL" ? "" : next);
        }}
      >
        <ComboboxInput className="w-44" placeholder={t("status")} />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="ALL">{t("allStatuses")}</ComboboxItem>
            {TRIAL_STATUSES.map((value) => (
              <ComboboxItem key={value} value={value}>
                {statusLabel(value)}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <TierFilter table={table} catalog={catalog} />
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

function TierFilter({
  table,
  catalog,
}: {
  table: import("@tanstack/react-table").Table<DataTableFeatures, AdminTrial>;
  catalog: AdminTierCatalog;
}) {
  const t = useTranslations("admin.trials");
  const [tier, setTier] = useState("ALL");

  return (
    <Combobox
      value={tier}
      onValueChange={(value) => {
        const next = typeof value === "string" ? value : "ALL";
        setTier(next);
        table.getColumn("tier")?.setFilterValue(next === "ALL" ? "" : next);
      }}
    >
      <ComboboxInput className="w-44" placeholder={t("tier")} />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxItem value="ALL">{t("allTiers")}</ComboboxItem>
          {catalog.tiers.map((option) => (
            <ComboboxItem key={option.name} value={option.name}>
              {option.name}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

/**
 * Grant-a-trial flow, in a dialog so it doesn't compete for space with the
 * overview strip or the table — the same pattern as inviting a teammate.
 */
function GrantTrialDialog({ catalog }: { catalog: AdminTierCatalog }) {
  const t = useTranslations("admin.trials");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const defaultTier = catalog.tiers[0]?.name ?? "";
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<GrantTrialFormValues>({
    // The schema checks the tenant/event structurally (an id is required); the
    // form value carries the full entry so each combobox can display the pick.
    resolver: zodResolver(grantTrialSchema) as Resolver<GrantTrialFormValues>,
    defaultValues: {
      tenant: null,
      event: null,
      tier: defaultTier,
      expiresAt: "",
    },
  });

  const tenant = useWatch({ control, name: "tenant" });

  function resetForm() {
    reset({ tenant: null, event: null, tier: defaultTier, expiresAt: "" });
  }

  async function onSubmit(values: GrantTrialFormValues) {
    if (!values.tenant || !values.event) {
      toast.error(t("pickBoth"));
      return;
    }
    const result = await grantTrialAction({
      tenantId: values.tenant.id,
      eventId: values.event.id,
      tier: values.tier,
      expiresAt: new Date(values.expiresAt).toISOString(),
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t("grantedToast"));
    resetForm();
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-3.5" data-icon="inline-start" />
          {t("grant")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("grant")}</DialogTitle>
          <DialogDescription>{t("grantText")}</DialogDescription>
        </DialogHeader>
        <form id="grant-trial-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Controller
            control={control}
            name="tenant"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="trial-tenant">{t("organization")}</FieldLabel>
                <TenantCombobox
                  id="trial-tenant"
                  value={field.value}
                  onChange={(next) => {
                    field.onChange(next);
                    // A picked event never survives a change of organization.
                    setValue("event", null);
                  }}
                />
                <FormFieldError error={fieldState.error} />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="event"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="trial-event">{t("event")}</FieldLabel>
                <EventCombobox
                  id="trial-event"
                  tenantId={tenant?.id ?? null}
                  value={field.value}
                  onChange={field.onChange}
                />
                <FormFieldError error={fieldState.error} />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="tier"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("tier")}</FieldLabel>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                >
                  {catalog.tiers.map((option) => (
                    <Label
                      key={option.name}
                      htmlFor={`trial-tier-${option.name}`}
                      className="flex cursor-pointer flex-col gap-1.5 rounded-lg border p-3 text-sm font-normal transition-colors has-data-checked:border-foreground has-data-checked:ring-1 has-data-checked:ring-foreground"
                    >
                      <span className="flex items-center justify-between">
                        <span className="font-medium">{option.name}&nbsp;{" "}</span>
                        <RadioGroupItem value={option.name} id={`trial-tier-${option.name}`} />
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t("upToGuests", { count: option.maxGuests })}
                      </span>
                      <span className="text-sm font-semibold">
                        {formatAmount(option.priceMinor, catalog.currency)}
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
                <FieldDescription>{t("tierHint")}</FieldDescription>
                <FormFieldError error={fieldState.error} />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="expiresAt"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{t("expires")}</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="datetime-local"
                  aria-invalid={fieldState.invalid}
                />
                <FormFieldError error={fieldState.error} />
              </Field>
            )}
          />
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <Button type="submit" form="grant-trial-form" disabled={isSubmitting}>
            {isSubmitting ? t("granting") : t("grant")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
