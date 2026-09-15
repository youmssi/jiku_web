"use client";

import { useRouter } from "next/navigation";
import { FileSignature } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
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
import {
  createAgreementAction,
  interruptAgreementAction,
  renewAgreementAction,
} from "./admin.service";
import { formatAmount, StatusBadge } from "./admin-ui";
import { TenantCombobox } from "./tenant-combobox";
import type { AdminAgreement, AdminTierCatalog } from "./schema";
import {
  createAgreementSchema,
  type CreateAgreementFormValues,
} from "./schema";

const COLUMNS: ColumnDef<DataTableFeatures, AdminAgreement>[] = [
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
    accessorKey: "kind",
    header: "Kind",
  },
  {
    id: "period",
    header: "Period",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {formatLocalDateTime(row.original.periodStart)} →{" "}
        {formatLocalDateTime(row.original.periodEnd)}
      </span>
    ),
  },
  {
    accessorKey: "renewalAt",
    header: "Renewal",
    cell: ({ row }) => formatLocalDateTime(row.original.renewalAt),
  },
  {
    id: "amount",
    header: "Amount",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.amountMinor != null && row.original.currency
        ? formatAmount(row.original.amountMinor, row.original.currency)
        : "—",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "notes",
    header: "Notes",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="block max-w-48 truncate text-muted-foreground">
        {row.original.interruptedReason ?? row.original.notes ?? "—"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.status === "ACTIVE" ? (
        <div className="flex gap-2">
          <ActionDialog
            trigger="Renew"
            title="Renew this agreement"
            description="Closes the current period and opens the next one, ending at the date below."
            fieldLabel="New period end (YYYY-MM-DD)"
            confirmLabel="Renew"
            onConfirm={(date) =>
              renewAgreementAction(row.original.id, toInstant(date))
            }
          />
          <ActionDialog
            trigger="Interrupt"
            title="Interrupt this agreement"
            description="For an ENTERPRISE_SAAS deal this also suspends the tenant immediately."
            fieldLabel="Reason"
            confirmLabel="Interrupt"
            destructive
            onConfirm={(reason) =>
              interruptAgreementAction(row.original.id, reason)
            }
          />
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
];

export function AgreementsView({
  agreements,
  catalog,
}: {
  agreements: AdminAgreement[];
  catalog: AdminTierCatalog;
}) {
  return (
    <div className="flex flex-col gap-6">
      <CreateAgreementForm currency={catalog.currency} />

      {agreements.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileSignature />
            </EmptyMedia>
            <EmptyTitle>No agreements yet</EmptyTitle>
            <EmptyDescription>
              Create an agreement above to open a billing period for a tenant.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <DataTable columns={COLUMNS} data={agreements} />
      )}
    </div>
  );
}

/** A date-only entry means end of that day, UTC. Invalid input becomes "" and the backend rejects it. */
function toInstant(date: string): string {
  const parsed = new Date(`${date.trim()}T23:59:59Z`);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function CreateAgreementForm({ currency }: { currency: string }) {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateAgreementFormValues>({
    // The schema checks the tenant structurally (an id is required); the form
    // value carries the full entry so the combobox can display the selection.
    resolver: zodResolver(
      createAgreementSchema,
    ) as Resolver<CreateAgreementFormValues>,
    defaultValues: {
      tenant: null,
      kind: "ENTERPRISE_SAAS",
      periodStart: "",
      periodEnd: "",
      amount: "",
      notes: "",
    },
  });

  async function onSubmit(values: CreateAgreementFormValues) {
    if (!values.tenant) {
      toast.error("Pick an organization first.");
      return;
    }
    const amount = values.amount?.trim();
    const result = await createAgreementAction({
      tenantId: values.tenant.id,
      kind: values.kind,
      periodStart: new Date(values.periodStart).toISOString(),
      periodEnd: new Date(`${values.periodEnd}T23:59:59Z`).toISOString(),
      // The platform currency (GNF) has no minor unit, so the typed amount is
      // the full amount rather than centimes.
      amountMinor: amount ? Math.round(Number(amount)) : null,
      currency: amount ? currency : null,
      notes: values.notes.trim() || null,
    });
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Agreement recorded.");
    reset();
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create agreement</CardTitle>
        <CardDescription>
          Open a billing period for an enterprise or on-premise deal. The amount
          is optional — the platform currency is {currency}.
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
                  <FieldLabel htmlFor="agr-tenant">Organization</FieldLabel>
                  <TenantCombobox
                    id="agr-tenant"
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
              name="kind"
              render={({ field, fieldState }) => (
                <Field
                  className="min-w-44 grow basis-44"
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel htmlFor="agr-kind">Kind</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="agr-kind"
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENTERPRISE_SAAS">
                        ENTERPRISE_SAAS
                      </SelectItem>
                      <SelectItem value="ON_PREMISE">ON_PREMISE</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="periodStart"
              render={({ field, fieldState }) => (
                <Field
                  className="min-w-40 grow basis-40"
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel htmlFor={field.name}>Starts</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="date"
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
              name="periodEnd"
              render={({ field, fieldState }) => (
                <Field
                  className="min-w-40 grow basis-40"
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel htmlFor={field.name}>Ends</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="date"
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
              name="amount"
              render={({ field, fieldState }) => (
                <Field
                  className="min-w-40 grow basis-40"
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel htmlFor={field.name}>
                    Amount ({currency}, optional)
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    min="0"
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
              name="notes"
              render={({ field, fieldState }) => (
                <Field
                  className="min-w-52 grow basis-52"
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel htmlFor={field.name}>Notes</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    />
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "…" : "Create"}
                    </Button>
                  </div>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
