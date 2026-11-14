"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Link } from "@/i18n/navigation";
import { billingReceiptRoute, ROUTES } from "@/lib/constants";
import { useLocale, useTranslations } from "next-intl";
import { formatAmount } from "@/lib/currency";
import { LocalDateTime } from "@/components/shared";
import { IssueInvoiceButton } from "@/components/modules/billing/invoice-actions";
import { usePurchaseLabel } from "./purchase-label";
import type { PaymentHistoryItem } from "./schema";

/** How a payment's outcome reads to the organizer (JIKU-307). */
type Outcome = "PENDING" | "SUCCEEDED" | "CANCELLED" | "EXPIRED" | "REJECTED" | "UNFINISHED";

/** The provider name of a transfer request. */
const MANUAL = "manual";

/** A desk refusal and an unfinished online attempt are both FAILED; the organizer reads them apart. */
function outcomeOf(payment: PaymentHistoryItem): Outcome {
  switch (payment.status) {
    case "SUCCEEDED":
    case "CANCELLED":
    case "EXPIRED":
      return payment.status;
    case "FAILED":
      return payment.provider === MANUAL ? "REJECTED" : "UNFINISHED";
    default:
      return "PENDING";
  }
}

/** Shown by default: what was paid and what still waits. */
const MAIN: ReadonlySet<Outcome> = new Set(["PENDING", "SUCCEEDED"]);

const TONE: Record<Outcome, string> = {
  SUCCEEDED: "text-green-600 dark:text-green-400",
  REJECTED: "text-red-600 dark:text-red-400",
  PENDING: "text-amber-700 dark:text-amber-400",
  CANCELLED: "text-muted-foreground",
  EXPIRED: "text-muted-foreground",
  UNFINISHED: "text-muted-foreground",
};

/**
 * Payment history table shared between the per-event and all-events billing
 * views. Paid and waiting payments show by default; cancelled, expired,
 * declined and unfinished ones sit behind "Show all" (JIKU-307).
 */
export function PaymentHistoryTable({ payments }: { payments: PaymentHistoryItem[] }) {
  const t = useTranslations("billing.history");
  const locale = useLocale();
  const purchaseLabel = usePurchaseLabel();
  const [showAll, setShowAll] = useState(false);
  const hidden = payments.filter((payment) => !MAIN.has(outcomeOf(payment))).length;
  const shown = showAll ? payments : payments.filter((payment) => MAIN.has(outcomeOf(payment)));
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
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("date")}</TableHead>
              <TableHead>{t("purchase")}</TableHead>
              <TableHead>{t("amount")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("receipt")}</TableHead>
              <TableHead>{t("invoice")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.map((payment) => {
              const outcome = outcomeOf(payment);
              return (
                <TableRow key={payment.paymentId}>
                  <TableCell><LocalDateTime value={payment.createdAt} /></TableCell>
                  <TableCell>{purchaseLabel(payment)}</TableCell>
                  <TableCell>{formatAmount(payment.amountMinor, payment.currency, locale)}</TableCell>
                  <TableCell>
                    <span className={TONE[outcome]}>{t(`statuses.${outcome}`)}</span>
                    {outcome === "REJECTED" && payment.rejectionReason ? (
                      <span className="block text-xs text-muted-foreground">
                        {t("reason", { reason: payment.rejectionReason })}
                      </span>
                    ) : null}
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
              );
            })}
          </TableBody>
        </Table>
      </div>
      {hidden > 0 ? (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {showAll ? null : <span>{t("filtered")}</span>}
          <Button variant="link" className="h-auto px-0" onClick={() => setShowAll((value) => !value)}>
            {showAll ? t("showMain") : t("showAll", { count: hidden })}
          </Button>
        </div>
      ) : null}
      <p className="text-sm text-muted-foreground">
        {t.rich("automatic", {
          settings: (chunks) => (
            <Link href={`${ROUTES.SETTINGS}?tab=legal`} className="underline underline-offset-4">
              {chunks}
            </Link>
          ),
        })}
      </p>
    </div>
  );
}
