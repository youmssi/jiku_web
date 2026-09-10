"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, Timer } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatLocalDateTime } from "@/lib/datetime";
import { ActionDialog } from "./action-dialog";
import { endTrialAction, grantTrialAction } from "./admin.service";
import { formatAmount, StatusBadge } from "./admin-ui";
import { TenantCombobox } from "./tenant-combobox";
import type { AdminTierCatalog, AdminTrial } from "./schema";
import {
  grantTrialSchema,
  type GrantTrialFormValues,
} from "./schema";

const TRIAL_STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "CONVERTED", label: "Converted" },
  { value: "ENDED", label: "Ended" },
  { value: "EXPIRED", label: "Expired" },
];

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
    header: "Tenant",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.tenantId.slice(0, 8)}…
      </span>
    ),
  },
  {
    id: "event",
    header: "Event",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.eventId.slice(0, 8)}…
      </span>
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
    cell: ({ row }) => formatLocalDateTime(row.original.expiresAt),
  },
  {
    accessorKey: "status",
    header: "Status",
    filterFn: "includesString",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
  trials,
  catalog,
}: {
  trials: AdminTrial[];
  catalog: AdminTierCatalog;
}) {
  return (
    <div className="flex flex-col gap-6">
      <GrantTrialForm catalog={catalog} />

      {trials.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Timer />
            </EmptyMedia>
            <EmptyTitle>No trials yet</EmptyTitle>
            <EmptyDescription>
              Grant a trial above to unlock a free allowance for one event.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <DataTable
          columns={COLUMNS}
          data={trials}
          toolbar={(table) => <TrialsToolbar table={table} catalog={catalog} />}
        />
      )}
    </div>
  );
}

/**
 * Client-side filters of the trials table: the page is not server-filtered, so
 * the table owns tier and status filtering like the organizer's data tables.
 */
function TrialsToolbar({
  table,
  catalog,
}: {
  table: import("@tanstack/react-table").Table<DataTableFeatures, AdminTrial>;
  catalog: AdminTierCatalog;
}) {
  const [status, setStatus] = useState("ALL");

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

function GrantTrialForm({ catalog }: { catalog: AdminTierCatalog }) {
  const router = useRouter();
  const defaultTier = catalog.tiers[0]?.name ?? "";
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<GrantTrialFormValues>({
    // The schema checks the tenant structurally (an id is required); the form
    // value carries the full entry so the combobox can display the selection.
    resolver: zodResolver(grantTrialSchema) as Resolver<GrantTrialFormValues>,
    defaultValues: {
      tenant: null,
      eventId: "",
      tier: defaultTier,
      expiresAt: "",
    },
  });

  const tier = useWatch({ control, name: "tier" });
  const selectedTier = catalog.tiers.find((option) => option.name === tier);

  async function onSubmit(values: GrantTrialFormValues) {
    if (!values.tenant) {
      toast.error("Pick an organization first.");
      return;
    }
    const result = await grantTrialAction({
      tenantId: values.tenant.id,
      eventId: values.eventId.trim(),
      tier: values.tier,
      expiresAt: new Date(values.expiresAt).toISOString(),
    });
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Trial granted — the organizer has been notified.");
    reset({ tenant: null, eventId: "", tier: defaultTier, expiresAt: "" });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grant trial</CardTitle>
        <CardDescription>
          Grant a free allowance for one event. The organizer is notified and
          the allowance expires at the date below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-wrap items-end gap-4">
            <Controller
              control={control}
              name="tenant"
              render={({ field, fieldState }) => (
                <Field
                  className="min-w-64 grow basis-64"
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel htmlFor="trial-tenant">Organization</FieldLabel>
                  <TenantCombobox
                    id="trial-tenant"
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
              name="eventId"
              render={({ field, fieldState }) => (
                <Field
                  className="min-w-44 grow basis-44"
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel htmlFor={field.name}>Event id</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="00000000-…"
                    aria-invalid={fieldState.invalid}
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
                <Field
                  className="min-w-48 grow basis-48"
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel htmlFor="trial-tier">Tier</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="trial-tier"
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      <SelectValue placeholder="Pick a tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalog.tiers.map((option) => (
                        <SelectItem key={option.name} value={option.name}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    {selectedTier
                      ? `Up to ${selectedTier.maxGuests.toLocaleString()} guests · ${formatAmount(selectedTier.priceMinor, catalog.currency)}`
                      : "Pick a tier to see its capacity and price."}
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
                <Field
                  className="min-w-56 grow basis-56"
                  data-invalid={fieldState.invalid}
                >
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
            <Button type="submit" disabled={isSubmitting} className="shrink-0">
              {isSubmitting ? "Granting…" : "Grant trial"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
