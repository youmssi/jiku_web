"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ADMIN_ROUTES } from "@/lib/constants";
import { formatLocalDateTime } from "@/lib/datetime";
import { ActionDialog } from "./action-dialog";
import { confirmPaymentAction, rejectPaymentAction } from "./admin.service";
import { AdminTable, EmptyRow, formatAmount, StatusBadge } from "./admin-ui";
import type { AdminPayment } from "./schema";

const STATUS_FILTERS = ["PENDING", "SUCCEEDED", "FAILED"] as const;

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
      <div className="flex gap-2">
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

      <AdminTable
        headers={["Date", "Reference", "Tier", "Amount", "Provider", "Tenant", "Status", "Actions"]}
      >
        {payments.length === 0 ? (
          <EmptyRow span={8} label={`No ${active.toLowerCase()} payments.`} />
        ) : (
          payments.map((payment) => (
            <tr key={payment.id}>
              <td className="px-4 py-2">{formatLocalDateTime(payment.createdAt)}</td>
              <td className="px-4 py-2 font-mono font-medium">{payment.reference || "—"}</td>
              <td className="px-4 py-2">{payment.tier}</td>
              <td className="px-4 py-2">{formatAmount(payment.amountMinor, payment.currency)}</td>
              <td className="px-4 py-2">{payment.provider}</td>
              <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                {payment.tenantId.slice(0, 8)}…
              </td>
              <td className="px-4 py-2">
                <StatusBadge status={payment.status} />
              </td>
              <td className="px-4 py-2">
                {payment.status === "PENDING" && payment.provider === "manual" ? (
                  <div className="flex gap-2">
                    <ActionDialog
                      trigger="Mark paid"
                      title={`Confirm ${payment.reference}`}
                      description="Only confirm after the transfer is visible on the receiving account. This unlocks the tier immediately."
                      fieldLabel="Observed transaction reference"
                      confirmLabel="Confirm payment"
                      onConfirm={(reference) => confirmPaymentAction(payment.id, reference)}
                    />
                    <ActionDialog
                      trigger="Reject"
                      title={`Reject ${payment.reference}`}
                      description="The organizer is notified and can submit a new request."
                      fieldLabel="Reason"
                      confirmLabel="Reject"
                      destructive
                      onConfirm={(reason) => rejectPaymentAction(payment.id, reason)}
                    />
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}
