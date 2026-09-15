"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, CreditCard } from "lucide-react";
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

const COLUMNS: ColumnDef<DataTableFeatures, AdminPayment>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="size-3.5" />
      </Button>
    ),
    cell: ({ row }) => formatLocalDateTime(row.original.createdAt),
  },
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => (
      <span className="font-mono font-medium">
        {row.original.reference || "—"}
      </span>
    ),
  },
  {
    accessorKey: "tier",
    header: "Tier",
  },
  {
    accessorKey: "amountMinor",
    header: "Amount",
    cell: ({ row }) =>
      formatAmount(row.original.amountMinor, row.original.currency),
  },
  {
    accessorKey: "provider",
    header: "Provider",
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.status === "PENDING" &&
      row.original.provider === "manual" ? (
        <div className="flex gap-2">
          <ActionDialog
            trigger="Mark paid"
            title={`Confirm ${row.original.reference}`}
            description="Only confirm after the transfer is visible on the receiving account. This unlocks the tier immediately."
            fieldLabel="Observed transaction reference"
            confirmLabel="Confirm payment"
            onConfirm={(reference) =>
              confirmPaymentAction(row.original.id, reference)
            }
          />
          <ActionDialog
            trigger="Reject"
            title={`Reject ${row.original.reference}`}
            description="The organizer is notified and can submit a new request."
            fieldLabel="Reason"
            confirmLabel="Reject"
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

export function PaymentsView({ payments }: { payments: AdminPayment[] }) {
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
            {status}
          </Button>
        ))}
      </div>

      {payments.length === 0 ? (
        <Empty className="mt-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CreditCard />
            </EmptyMedia>
            <EmptyTitle>No payments</EmptyTitle>
            <EmptyDescription>
              {`No ${active.toLowerCase()} payments.`}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <DataTable columns={COLUMNS} data={payments} />
      )}
    </div>
  );
}
