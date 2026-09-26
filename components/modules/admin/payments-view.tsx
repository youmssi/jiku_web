"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { ArrowUpDown, CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableFeatures } from "@/components/ui/data-table-features";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ADMIN_ROUTES } from "@/lib/constants";
import { formatLocalDateTime } from "@/lib/datetime";
import { ActionDialog } from "./action-dialog";
import { confirmPaymentAction, rejectPaymentAction } from "./admin.service";
import { formatAmount, StatusBadge } from "./admin-ui";
import type { AdminPayment } from "./schema";

const STATUS_FILTERS = ["PENDING", "SUCCEEDED", "FAILED"] as const;

function useColumns(): ColumnDef<DataTableFeatures, AdminPayment>[] {
  const t = useTranslations("admin.payments");
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
        {t("date")}
        <ArrowUpDown className="size-3.5" />
      </Button>
    ),
    cell: ({ row }) => formatLocalDateTime(row.original.createdAt),
  },
  {
    accessorKey: "reference",
    header: t("reference"),
    cell: ({ row }) => (
      <span className="font-mono font-medium">
        {row.original.reference || "—"}
      </span>
    ),
  },
  {
    accessorKey: "tier",
    header: t("tier"),
  },
  {
    accessorKey: "amountMinor",
    header: t("amount"),
    cell: ({ row }) =>
      formatAmount(row.original.amountMinor, row.original.currency),
  },
  {
    accessorKey: "provider",
    header: t("provider"),
  },
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
    accessorKey: "status",
    header: common("status"),
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: common("actions"),
    enableSorting: false,
    cell: ({ row }) =>
      row.original.status === "PENDING" &&
      row.original.provider === "manual" ? (
        <div className="flex gap-2">
          <ActionDialog
            trigger={t("markPaid")}
            title={t("confirmTitle", { reference: row.original.reference })}
            description={t("confirmText")}
            fieldLabel={t("observedReference")}
            confirmLabel={t("confirm")}
            onConfirm={(reference) =>
              confirmPaymentAction(row.original.id, reference)
            }
          />
          <ActionDialog
            trigger={t("reject")}
            title={t("rejectTitle", { reference: row.original.reference })}
            description={t("rejectText")}
            fieldLabel={t("reason")}
            confirmLabel={t("reject")}
            destructive
            onConfirm={(reason) =>
              rejectPaymentAction(row.original.id, reason)
            }
          />
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
];
}

export function PaymentsView({ payments }: { payments: AdminPayment[] }) {
  const t = useTranslations("admin.payments");
  const columns = useColumns();
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("status") ?? "PENDING";

  function filter(status: string) {
    const params = new URLSearchParams();
    params.set("status", status);
    router.push(`${ADMIN_ROUTES.PAYMENTS}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <Button
            key={status}
            size="sm"
            variant={active === status ? "default" : "outline"}
            onClick={() => filter(status)}
          >
            {t(`filters.${status}`)}
          </Button>
        ))}
      </div>

      {payments.length === 0 ? (
        <Empty className="mt-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CreditCard />
            </EmptyMedia>
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyText")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <DataTable columns={columns} data={payments} />
      )}
    </div>
  );
}
