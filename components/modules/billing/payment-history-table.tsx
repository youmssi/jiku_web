import Link from "next/link";
import { CreditCard } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { billingReceiptRoute } from "@/lib/constants";
import { formatAmount } from "@/lib/currency";
import { formatLocalDateTime } from "@/lib/datetime";
import { IssueInvoiceButton } from "@/components/modules/billing/invoice-actions";
import type { PaymentHistoryItem } from "./schema";

/** Payment history table shared between the per-event and all-events billing views. */
export function PaymentHistoryTable({ payments }: { payments: PaymentHistoryItem[] }) {
  if (payments.length === 0) {
    return (
      <Empty className="py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CreditCard />
          </EmptyMedia>
          <EmptyTitle>No payments yet</EmptyTitle>
          <EmptyDescription>
            Payments you request appear here once they are recorded.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Receipt</TableHead>
            <TableHead>Invoice</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.paymentId}>
              <TableCell>{formatLocalDateTime(payment.createdAt)}</TableCell>
              <TableCell>{payment.eventName}</TableCell>
              <TableCell>{payment.tier}</TableCell>
              <TableCell>{formatAmount(payment.amountMinor, payment.currency)}</TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell>
                {payment.status === "SUCCEEDED" ? (
                  <Link
                    href={billingReceiptRoute(payment.paymentId)}
                    className="underline underline-offset-4"
                    prefetch={false}
                  >
                    Download
                  </Link>
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </TableCell>
              <TableCell>
                {payment.status === "SUCCEEDED" ? (
                  <IssueInvoiceButton paymentId={payment.paymentId} />
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
