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
import { useLocale, useTranslations } from "next-intl";
import { formatAmount } from "@/lib/currency";
import { formatLocalDateTime } from "@/lib/datetime";
import { IssueInvoiceButton } from "@/components/modules/billing/invoice-actions";
import type { PaymentHistoryItem } from "./schema";

const STATUSES = ["PENDING", "SUCCEEDED", "FAILED"] as const;
type PaymentStatus = (typeof STATUSES)[number];

/** Payment history table shared between the per-event and all-events billing views. */
export function PaymentHistoryTable({ payments }: { payments: PaymentHistoryItem[] }) {
  const t = useTranslations("billing.history");
  const locale = useLocale();
  if (payments.length === 0) {
    return (
      <Empty className="py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CreditCard />
          </EmptyMedia>
          <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
          <EmptyDescription>
            {t("emptyText")}
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
            <TableHead>{t("date")}</TableHead>
            <TableHead>{t("event")}</TableHead>
            <TableHead>{t("tier")}</TableHead>
            <TableHead>{t("amount")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead>{t("receipt")}</TableHead>
            <TableHead>{t("invoice")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.paymentId}>
              <TableCell>{formatLocalDateTime(payment.createdAt)}</TableCell>
              <TableCell>{payment.eventId ? payment.eventName : t("subscription")}</TableCell>
              <TableCell>{payment.tier}</TableCell>
              <TableCell>{formatAmount(payment.amountMinor, payment.currency, locale)}</TableCell>
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
                  {STATUSES.includes(payment.status as PaymentStatus) ? t(`statuses.${payment.status as PaymentStatus}`) : payment.status}
                </span>
              </TableCell>
              <TableCell>
                {payment.status === "SUCCEEDED" ? (
                  <a
                    href={billingReceiptRoute(payment.paymentId)}
                    className="underline underline-offset-4"
                  >
                    {t("download")}
                  </a>
                ) : (
                  <span className="text-muted-foreground">{t("none")}</span>
                )}
              </TableCell>
              <TableCell>
                {payment.status === "SUCCEEDED" ? (
                  <IssueInvoiceButton paymentId={payment.paymentId} />
                ) : (
                  <span className="text-muted-foreground">{t("none")}</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
