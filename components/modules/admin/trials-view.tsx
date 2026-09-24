"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Stat } from "@/components/shared";
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

const TRIAL_STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "CONVERTED", label: "Converted" },
  { value: "ENDED", label: "Ended" },
  { value: "EXPIRED", label: "Expired" },
];

/** Sentinel filter value the "Expiring ≤ 7d" toolbar chip sets on the Expires column. */
const EXPIRING_SOON_FILTER = "EXPIRING_SOON";

/** Whole days from now until `iso`; negative once the deadline has passed. */
function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

function isExpiringSoon(trial: AdminTrial): boolean {
  return trial.status === "ACTIVE" && daysUntil(trial.expiresAt) <= 7;
}

function countdownLabel(days: number): string {
  if (days < 0) return "Overdue";
  if (days === 0) return "Expires today";
  if (days === 1) return "Expires tomorrow";
  return `Expires in ${days} days`;
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

const COLUMNS: ColumnDef<DataTableFeatures, AdminTrial>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Granted
        <ArrowUpDown className="size-3.5" />
      </Button>
    ),
    cell: ({ row }) => formatLocalDateTime(row.original.createdAt),
  },
  {
    id: "tenant",
    header: "Organization",
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
    header: "Event",
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
    header: "Tier",
    filterFn: "includesString",
  },
  {
    accessorKey: "expiresAt",
    header: "Expires",
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
                {countdownLabel(days)}
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
          <TooltipContent>Expires {formatLocalDateTime(trial.expiresAt)}</TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    filterFn: "includesString",
    cell: ({ row }) => <TrialStatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.status === "ACTIVE" ? (
        <ActionDialog
          trigger="End early"
          title="End this trial"
          description="The event's allowance reverts to its paid entitlement and the organizer is notified."
          fieldLabel="Reason"
          confirmLabel="End trial"
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

export function TrialsView({
  trialsPage,
  stats,
  catalog,
}: {
  trialsPage: AdminTrialPage;
  stats: AdminTrialStats;
  catalog: AdminTierCatalog;
}) {
  const { entries: trials } = trialsPage;

  return (
    <div className="flex flex-col gap-6">
      <TrialsOverview stats={stats} />

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Every trial ever granted, newest first.
        </p>
        <GrantTrialDialog catalog={catalog} />
      </div>

      {trials.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Timer />
            </EmptyMedia>
            <EmptyTitle>No trials yet</EmptyTitle>
            <EmptyDescription>
              Grant a trial to unlock a free allowance for one event.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <DataTable
            columns={COLUMNS}
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
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Active trials" value={stats.active} />
      <Stat
        label="Expiring ≤ 7 days"
        value={stats.expiringWithin7Days}
        tone={stats.expiringWithin7Days > 0 ? "urgent" : "default"}
      />
      <Stat label="Converted this month" value={stats.convertedThisMonth} tone="positive" />
      <Stat
        label="Conversion rate"
        value={stats.conversionRatePercent === null ? "—" : `${Math.round(stats.conversionRatePercent)}%`}
      />
    </div>
  );
}

function TrialsPager({ page, size, total }: { page: number; size: number; total: number }) {
  const pageCount = Math.max(1, Math.ceil(total / size));
  if (pageCount <= 1) {
    return (
      <p className="text-xs text-muted-foreground">
        Showing all {total} trial{total === 1 ? "" : "s"}.
      </p>
    );
  }
  const hasPrevious = page > 0;
  const hasNext = page + 1 < pageCount;
  const rangeStart = page * size + 1;
  const rangeEnd = Math.min(total, (page + 1) * size);

  return (
    <nav aria-label="pagination" className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">
        Showing {rangeStart}–{rangeEnd} of {total} trials
      </span>
      <div className="flex items-center gap-2">
        {hasPrevious ? (
          <Button asChild variant="outline" size="sm">
            <Link href={`${ADMIN_ROUTES.TRIALS}?page=${page - 1}`}>Previous</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
        )}
        <span className="text-xs text-muted-foreground">
          Page {page + 1} of {pageCount}
        </span>
        {hasNext ? (
          <Button asChild variant="outline" size="sm">
            <Link href={`${ADMIN_ROUTES.TRIALS}?page=${page + 1}`}>Next</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next
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
        <ComboboxInput className="w-44" placeholder="Status" />
        <ComboboxContent>
          <ComboboxList>
            {TRIAL_STATUS_OPTIONS.map((option) => (
              <ComboboxItem key={option.value} value={option.value}>
                {option.label}
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
        Expiring ≤ 7d
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
      <ComboboxInput className="w-44" placeholder="Tier" />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxItem value="ALL">All tiers</ComboboxItem>
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
      toast.error("Pick an organization and an event first.");
      return;
    }
    const result = await grantTrialAction({
      tenantId: values.tenant.id,
      eventId: values.event.id,
      tier: values.tier,
      expiresAt: new Date(values.expiresAt).toISOString(),
    });
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Trial granted — the organizer has been notified.");
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
          Grant trial
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Grant trial</DialogTitle>
          <DialogDescription>
            Grant a free allowance for one event. The organizer is notified
            instantly and sees a countdown to the deadline in their own
            dashboard.
          </DialogDescription>
        </DialogHeader>
        <form id="grant-trial-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Controller
            control={control}
            name="tenant"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="trial-tenant">Organization</FieldLabel>
                <TenantCombobox
                  id="trial-tenant"
                  value={field.value}
                  onChange={(next) => {
                    field.onChange(next);
                    // A picked event never survives a change of organization.
                    setValue("event", null);
                  }}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />
          <Controller
            control={control}
            name="event"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="trial-event">Event</FieldLabel>
                <EventCombobox
                  id="trial-event"
                  tenantId={tenant?.id ?? null}
                  value={field.value}
                  onChange={field.onChange}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />
          <Controller
            control={control}
            name="tier"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Tier</FieldLabel>
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
                        Up to {option.maxGuests.toLocaleString()} guests
                      </span>
                      <span className="text-sm font-semibold">
                        {formatAmount(option.priceMinor, catalog.currency)}
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
                <FieldDescription>
                  This capacity and price are granted for free — pick deliberately.
                </FieldDescription>
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />
          <Controller
            control={control}
            name="expiresAt"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Expires</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="datetime-local"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="grant-trial-form" disabled={isSubmitting}>
            {isSubmitting ? "Granting…" : "Grant trial"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
