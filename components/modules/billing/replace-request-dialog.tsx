"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatAmount } from "@/lib/currency";
import { usePurchaseLabel } from "./purchase-label";
import type { ManualPaymentInstructions } from "./schema";

/**
 * Asked before a new request replaces one still waiting for the same purchase
 * (JIKU-307), so the organizer knows the old reference and amount no longer
 * apply and never pays both.
 */
export function ReplaceRequestDialog({
  waiting,
  onConfirm,
  onCancel,
}: {
  /** The request about to be replaced; the dialog is open while it is set. */
  waiting: ManualPaymentInstructions | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("billing.requests");
  const locale = useLocale();
  const purchaseLabel = usePurchaseLabel();
  return (
    <AlertDialog open={waiting !== null} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("replaceTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {waiting
              ? t("replaceText", {
                  purchase: purchaseLabel({ ...waiting, eventTitle: waiting.eventName }),
                  amount: formatAmount(waiting.amountMinor, waiting.currency, locale),
                  reference: waiting.reference,
                })
              : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("keep")}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{t("replaceConfirm")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
