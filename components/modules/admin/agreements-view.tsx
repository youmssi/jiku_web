"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FileSignature, Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
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
import { Field, FieldLabel } from "@/components/ui/field";
import { FormFieldError } from "@/components/shared";
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

function useColumns(): ColumnDef<DataTableFeatures, AdminAgreement>[] {
  const t = useTranslations("admin.agreements");
  const common = useTranslations("admin.common");
  return [
  {
    id: "tenant",
    header: t("tenant"),
    enableSorting: false,
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.tenantId.slice(0, 8)}…
      </span>
    ),
  },
  {
    accessorKey: "kind",
    header: t("kind"),
  },
  {
    id: "period",
    header: t("period"),
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
    header: t("renewal"),
    cell: ({ row }) => formatLocalDateTime(row.original.renewalAt),
  },
  {
    id: "amount",
    header: t("amount"),
    enableSorting: false,
    cell: ({ row }) =>
      row.original.amountMinor != null && row.original.currency
        ? formatAmount(row.original.amountMinor, row.original.currency)
        : "—",
  },
  {
    accessorKey: "status",
    header: common("status"),
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "notes",
    header: t("notes"),
    enableSorting: false,
    cell: ({ row }) => (
      <span className="block max-w-48 truncate text-muted-foreground">
        {row.original.interruptedReason ?? row.original.notes ?? "—"}
      </span>
    ),
  },
  {
    id: "actions",
    header: common("actions"),
    enableSorting: false,
    cell: ({ row }) =>
      row.original.status === "ACTIVE" ? (
        <div className="flex gap-2">
          <ActionDialog
            trigger={t("renew")}
            title={t("renewTitle")}
            description={t("renewText")}
            fieldLabel={t("newEnd")}
            confirmLabel={t("renew")}
            onConfirm={(date) =>
              renewAgreementAction(row.original.id, toInstant(date))
            }
          />
          <ActionDialog
            trigger={t("interrupt")}
            title={t("interruptTitle")}
            description={t("interruptText")}
            fieldLabel={t("reason")}
            confirmLabel={t("interrupt")}
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
}

export function AgreementsView({
  agreements,
  catalog,
}: {
  agreements: AdminAgreement[];
  catalog: AdminTierCatalog;
}) {
  const t = useTranslations("admin.agreements");
  const columns = useColumns();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{t("intro")}</p>
        <CreateAgreementDialog currency={catalog.currency} />
      </div>

      {agreements.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileSignature />
            </EmptyMedia>
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyText")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <DataTable columns={columns} data={agreements} />
      )}
    </div>
  );
}

/** A date-only entry means end of that day, UTC. Invalid input becomes "" and the backend rejects it. */
function toInstant(date: string): string {
  const parsed = new Date(`${date.trim()}T23:59:59Z`);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

/**
 * Create-an-agreement flow, in a dialog so it doesn't compete for space with
 * the table — the same pattern as inviting a teammate or granting a trial.
 */
function CreateAgreementDialog({ currency }: { currency: string }) {
  const t = useTranslations("admin.agreements");
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
      toast.error(t("pickOrganization"));
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
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t("created"));
    reset();
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-3.5" data-icon="inline-start" />
          {t("create")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("create")}</DialogTitle>
          <DialogDescription>{t("createText", { currency })}</DialogDescription>
        </DialogHeader>
        <form id="create-agreement-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Controller
            control={control}
            name="tenant"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="agr-tenant">{t("organization")}</FieldLabel>
                <TenantCombobox
                  id="agr-tenant"
                  value={field.value}
                  onChange={field.onChange}
                />
                <FormFieldError error={fieldState.error} />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="kind"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="agr-kind">{t("kind")}</FieldLabel>
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
                <FormFieldError error={fieldState.error} />
              </Field>
            )}
          />
          <div className="flex flex-wrap gap-4">
            <Controller
              control={control}
              name="periodStart"
              render={({ field, fieldState }) => (
                <Field className="min-w-40 grow basis-40" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("starts")}</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="date"
                    aria-invalid={fieldState.invalid}
                  />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="periodEnd"
              render={({ field, fieldState }) => (
                <Field className="min-w-40 grow basis-40" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("ends")}</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="date"
                    aria-invalid={fieldState.invalid}
                  />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
          </div>
          <Controller
            control={control}
            name="amount"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{t("amountLabel", { currency })}</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  min="0"
                  aria-invalid={fieldState.invalid}
                />
                <FormFieldError error={fieldState.error} />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="notes"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{t("notes")}</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
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
          <Button type="submit" form="create-agreement-form" disabled={isSubmitting}>
            {isSubmitting ? t("creating") : t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
