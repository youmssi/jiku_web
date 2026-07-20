import Link from "next/link";
import { billingReceiptRoute } from "@/lib/constants";
import { formatLocalDateTime } from "@/lib/datetime";
import type { PaymentHistoryItem } from "./schema";

function formatAmount(minor: number, currency: string): string {
  return `${(minor / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency}`;
}

/** Payment history table shared between the per-event and all-events billing views. */
export function PaymentHistoryTable({ payments }: { payments: PaymentHistoryItem[] }) {
  if (payments.length === 0) {
    return <p className="text-sm text-muted-foreground">No payments yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Event</th>
            <th className="px-4 py-2">Tier</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Receipt</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {payments.map((payment) => (
            <tr key={payment.paymentId}>
              <td className="px-4 py-2">{formatLocalDateTime(payment.createdAt)}</td>
              <td className="px-4 py-2">{payment.eventName}</td>
              <td className="px-4 py-2">{payment.tier}</td>
              <td className="px-4 py-2">{formatAmount(payment.amountMinor, payment.currency)}</td>
              <td className="px-4 py-2">
                <span
                  className={
                    payment.status === "SUCCEEDED"
                      ? "text-green-600 dark:text-green-400"
                      : payment.status === "FAILED"
                        ? "text-red-600 dark:text-red-400"
                        : "text-muted-foreground"
                  }
                >
                  {payment.status}
                </span>
              </td>
              <td className="px-4 py-2">
                {payment.status === "SUCCEEDED" ? (
                  <Link
                    href={billingReceiptRoute(payment.paymentId)}
                    className="underline underline-offset-4"
                    prefetch={false}
                  >
                    Download
                  </Link>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
