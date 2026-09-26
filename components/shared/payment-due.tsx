import { getLocale, getTranslations } from "next-intl/server";
import { ExternalLink } from "lucide-react";
import { formatAmount } from "@/lib/currency";
import type { Schema } from "@/lib/api-contract";

type PaymentMethods = Schema<"TenantPaymentMethodsInfo">;

interface PaymentDueProps {
  status: "NOT_REQUIRED" | "DUE" | "DUE_AFTER_SERVICE" | "PAID";
  amountMinor: number;
  currency: string;
  methods: PaymentMethods | null;
}

/**
 * What a client owes the organization for their ticket (JIKU-110) and how to
 * pay it: the payee named on the Mobile Money confirmation, the numbers to send
 * to, and the organization's payment link (JIKU-109). Nothing shows when the
 * ticket is free; a paid ticket says so.
 */
export async function PaymentDue({ status, amountMinor, currency, methods }: PaymentDueProps) {
  if (status === "NOT_REQUIRED") return null;
  const [t, locale] = await Promise.all([getTranslations("guest.payment"), getLocale()]);
  const amount = formatAmount(amountMinor, currency, locale);

  if (status === "PAID") {
    return <p className="rounded-lg border px-4 py-3 text-sm">{t("paid", { amount })}</p>;
  }

  const numbers = [
    { label: t("orangeMoney"), value: methods?.orangeMoneyNumber },
    { label: t("mtnMomo"), value: methods?.mtnMomoNumber },
    { label: t("wave"), value: methods?.waveNumber },
  ].filter((entry): entry is { label: string; value: string } => Boolean(entry.value));

  return (
    <div className="rounded-lg border px-4 py-3 text-left text-sm">
      <p className="font-medium">{status === "DUE_AFTER_SERVICE" ? t("dueAfter", { amount }) : t("due", { amount })}</p>
      {numbers.length > 0 ? (
        <div className="mt-2 space-y-1">
          {methods?.payeeName ? <p className="text-muted-foreground">{t("payee", { name: methods.payeeName })}</p> : null}
          <ul className="space-y-0.5">
            {numbers.map((entry) => (
              <li key={entry.label} className="flex justify-between gap-3">
                <span className="text-muted-foreground">{entry.label}</span>
                <span className="font-mono">{entry.value}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {methods?.paymentLinkUrl ? (
        <a
          href={methods.paymentLinkUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-3 inline-flex items-center gap-1.5 font-medium underline underline-offset-4"
        >
          {t("payOnline")}
          <ExternalLink aria-hidden className="size-3.5" />
        </a>
      ) : null}
      {numbers.length === 0 && !methods?.paymentLinkUrl ? (
        <p className="mt-1 text-muted-foreground">{t("askOrganizer")}</p>
      ) : null}
    </div>
  );
}
