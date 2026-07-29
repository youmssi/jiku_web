"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatAmount } from "@/lib/currency";
import type { ManualPaymentInstructions } from "./schema";

/**
 * Payment instructions for an open activation request (JIKU-45): what to pay,
 * where to send it, and the reference to quote. Rendered from the server-fetched
 * open request or right after submitting one, so it is never a one-shot screen.
 */
export function ActivationInstructions({
  instructions,
}: {
  instructions: ManualPaymentInstructions;
}) {
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
        Activation requested — {instructions.tier} tier,{" "}
        {formatAmount(instructions.amountMinor, instructions.currency)}
      </p>
      <p className="mt-2">
        Send the exact amount to the account below and include this reference with your
        transfer. Our team confirms the payment and unlocks your capacity — usually within
        a few hours, and you&apos;ll get a confirmation email.
      </p>

      <div className="mt-4 flex items-center gap-2">
        <code className="rounded-md bg-white/70 px-3 py-1.5 font-mono text-base font-semibold tracking-wider dark:bg-black/30">
          {instructions.reference}
        </code>
        <Button size="sm" variant="outline" onClick={copyReference}>
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <dl className="mt-4 space-y-1">
        {payee.payeeName ? (
          <div className="flex gap-2">
            <dt className="font-medium">Payee:</dt>
            <dd>{payee.payeeName}</dd>
          </div>
        ) : null}
        {payee.mobileMoneyNumber ? (
          <div className="flex gap-2">
            <dt className="font-medium">Mobile Money:</dt>
            <dd>
              {payee.mobileMoneyNumber}
              {payee.mobileMoneyOperator ? ` (${payee.mobileMoneyOperator})` : ""}
            </dd>
          </div>
        ) : null}
        {payee.bankDetails ? (
          <div className="flex gap-2">
            <dt className="font-medium">Bank transfer:</dt>
            <dd className="whitespace-pre-line">{payee.bankDetails}</dd>
          </div>
        ) : null}
      </dl>

      <p className="mt-4 text-xs opacity-80">
        Activation is confirmed by our team once the transfer is received — it is not
        instant. Never share card numbers or account passwords with anyone; we only need
        the transfer itself, with the reference above.
      </p>
    </div>
  );
}
