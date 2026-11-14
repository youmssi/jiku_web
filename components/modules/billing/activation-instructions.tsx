"use client";

import { useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatAmount } from "@/lib/currency";
import { usePurchaseLabel } from "./purchase-label";
import type { ManualPaymentInstructions } from "./schema";

/**
 * Payment instructions for a waiting transfer request (JIKU-45, JIKU-307): what
 * to pay, where to send it, the reference to quote, and until when it waits.
 * Rendered from the server-fetched request, so it is never a one-shot screen;
 * [children] holds the actions the organizer can take on it.
 */
export function ActivationInstructions({
  instructions,
  children,
}: {
  instructions: ManualPaymentInstructions;
  children?: React.ReactNode;
}) {
  const t = useTranslations("billing.instructions");
  const tRequests = useTranslations("billing.requests");
  const locale = useLocale();
  const format = useFormatter();
  const purchaseLabel = usePurchaseLabel();
  const day = (iso: string) => format.dateTime(new Date(iso), { dateStyle: "long" });
  const [copied, setCopied] = useState(false);
  const { payee } = instructions;

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(instructions.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions/insecure context): the reference
      // stays selectable text, so copying by hand still works.
    }
  }

  return (
    <div className="rounded-xl border border-blue-300 bg-blue-50 p-5 text-sm text-blue-950 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-100">
      <p className="font-semibold">
        {t("title", {
          purchase: purchaseLabel({ ...instructions, eventTitle: instructions.eventName }),
          amount: formatAmount(instructions.amountMinor, instructions.currency, locale),
        })}
      </p>
      <p className="mt-2">
        {t("text")}
      </p>

      <div className="mt-4 flex items-center gap-2">
        <code className="rounded-md bg-white/70 px-3 py-1.5 font-mono text-base font-semibold tracking-wider dark:bg-black/30">
          {instructions.reference}
        </code>
        <Button size="sm" variant="outline" onClick={copyReference}>
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? t("copied") : t("copy")}
        </Button>
      </div>

      <dl className="mt-4 space-y-1">
        {payee.payeeName ? (
          <div className="flex gap-2">
            <dt className="font-medium">{t("payee")} :</dt>
            <dd>{payee.payeeName}</dd>
          </div>
        ) : null}
        {payee.mobileMoneyNumber ? (
          <div className="flex gap-2">
            <dt className="font-medium">{t("mobileMoney")} :</dt>
            <dd>
              {payee.mobileMoneyNumber}
              {payee.mobileMoneyOperator ? ` (${payee.mobileMoneyOperator})` : ""}
            </dd>
          </div>
        ) : null}
        {payee.bankDetails ? (
          <div className="flex gap-2">
            <dt className="font-medium">{t("bank")} :</dt>
            <dd className="whitespace-pre-line">{payee.bankDetails}</dd>
          </div>
        ) : null}
        {payee.contactEmail || payee.contactPhone ? (
          <div className="flex gap-2">
            <dt className="font-medium">{t("questions")} :</dt>
            <dd>
              {[payee.contactEmail, payee.contactPhone].filter(Boolean).join(` ${t("or")} `)}
            </dd>
          </div>
        ) : null}
      </dl>

      {instructions.transferDeclaredAt ? (
        <p className="mt-4 font-medium">{tRequests("sentOn", { date: day(instructions.transferDeclaredAt) })}</p>
      ) : instructions.expiresAt ? (
        <p className="mt-4">{tRequests("expires", { date: day(instructions.expiresAt) })}</p>
      ) : null}

      <p className="mt-4 text-xs opacity-80">
        {t("safety")}
      </p>

      {children ? <div className="mt-4 flex flex-wrap gap-2 border-t border-blue-300/60 pt-4 dark:border-blue-900/50">{children}</div> : null}
    </div>
  );
}
