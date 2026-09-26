"use client";

import { useLocale, useTranslations } from "next-intl";
import { CircleCheck, CircleX, Clock, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { formatAmount } from "@/lib/currency";
import { billingRoute, ROUTES } from "@/lib/constants";
import { usePaymentStatus } from "@/components/modules/billing/usePaymentStatus";
import type { PaymentStatusView } from "@/components/modules/billing/schema";

/**
 * The page the payer lands on after the provider's (JIKU-165). The provider's
 * redirect proves nothing, so the page shows what the backend knows: waiting for
 * the provider's confirmation, then paid or not paid, and where to go next.
 */
export function PaymentReturn({ initial }: { initial: PaymentStatusView }) {
  const t = useTranslations("billing.online.return");
  const locale = useLocale();
  const { payment, timedOut } = usePaymentStatus(initial.paymentId, initial);
  const state = payment.status === "PENDING" ? (timedOut ? "late" : "pending") : payment.status === "SUCCEEDED" ? "paid" : "failed";
  const back = payment.kind === "TIER" && payment.eventId ? billingRoute(payment.eventId) : ROUTES.BILLING;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12">
      <Card className="w-full text-center">
        <CardHeader>
          <StateIcon state={state} />
          <CardTitle className="mt-2">{t(`${state}.title`)}</CardTitle>
          <CardDescription>{t(`${state}.text`)}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t(`kind.${kindKey(payment.kind)}`, { tier: payment.tier })}</p>
          <p className="mt-1 text-2xl font-semibold">{formatAmount(payment.amountMinor, payment.currency, locale)}</p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button asChild variant={state === "pending" ? "outline" : "default"}>
            <Link href={back}>{t("back")}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

type ReturnState = "pending" | "late" | "paid" | "failed";

const KINDS = ["TIER", "SUBSCRIPTION", "PACK", "PACK_EXTRA", "WHATSAPP_NUMBER"] as const;
type PaymentKind = (typeof KINDS)[number];

function kindKey(kind: string): PaymentKind {
  return KINDS.find((known) => known === kind) ?? "TIER";
}

function StateIcon({ state }: { state: ReturnState }) {
  if (state === "paid") return <CircleCheck className="mx-auto size-12 text-green-600" />;
  if (state === "failed") return <CircleX className="mx-auto size-12 text-destructive" />;
  if (state === "late") return <Clock className="mx-auto size-12 text-amber-500" />;
  return <LoaderCircle className="mx-auto size-12 animate-spin text-primary" />;
}

/** The return page opened without a payment of this organization. */
export function PaymentReturnMissing() {
  const t = useTranslations("billing.online.return");
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12">
      <Card className="w-full text-center">
        <CardHeader>
          <CircleX className="mx-auto size-12 text-muted-foreground" />
          <CardTitle className="mt-2">{t("missing.title")}</CardTitle>
          <CardDescription>{t("missing.text")}</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button asChild>
            <Link href={ROUTES.BILLING}>{t("back")}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
