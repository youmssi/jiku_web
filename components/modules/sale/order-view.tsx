import { getLocale, getTranslations } from "next-intl/server";
import { Ticket } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PaymentDue, VerifiedBadge } from "@/components/shared";
import { formatAmount } from "@/lib/currency";
import { ticketRoute } from "@/lib/constants";
import { formatEventDay, formatEventTime } from "@/lib/datetime";
import { DeclarePaymentForm } from "./declare-payment-form";
import { HoldCountdown } from "./hold-countdown";
import type { Order } from "./schema";

/**
 * The buyer's order (JIKU-177), reached by its link: what it holds, how to pay
 * the organization and how long the places are kept, then — once the
 * organization confirms — one link per ticket.
 */
export async function OrderView({ order, token }: { order: Order; token: string }) {
  const [t, locale] = await Promise.all([getTranslations("guest.order"), getLocale()]);
  const zone = order.eventTimezone;
  const when =
    order.eventStart && zone ? `${formatEventDay(order.eventStart, zone, locale)} · ${formatEventTime(order.eventStart, zone, locale)}` : null;

  return (
    <div className="flex flex-1 justify-center px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <header className="text-center">
          <p className="text-sm text-muted-foreground">{t("orderOf", { organizer: order.organizerName })}</p>
          <VerifiedBadge kind={order.organizerVerification} className="mt-2" />
          <h1 className="mt-2 text-balance text-2xl font-semibold">{order.eventName}</h1>
          {when ? <p className="mt-1 text-sm text-muted-foreground first-letter:uppercase">{when}</p> : null}
        </header>

        <section className="rounded-xl border p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-sm text-muted-foreground">{t("orderReference", { reference: order.reference })}</p>
            <p className="text-sm font-medium">{t(`status.${order.status}`)}</p>
          </div>
          <ul className="mt-3 space-y-1 text-sm">
            {order.lines.map((line) => (
              <li key={line.ticketTypeId} className="flex justify-between gap-3">
                <span>
                  {line.quantity} × {line.label}
                </span>
                <span className="tabular-nums">{formatAmount(line.unitPriceMinor * line.quantity, order.currency, locale)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between border-t pt-3 font-semibold">
            <span>{t("total")}</span>
            <span className="tabular-nums">{formatAmount(order.totalMinor, order.currency, locale)}</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{t("buyer", { name: order.buyerName })}</p>
        </section>

        {order.status === "AWAITING_PAYMENT" ? (
          <>
            <HoldCountdown expiresAt={order.expiresAt} />
            <PaymentDue
              status="DUE"
              amountMinor={order.totalMinor}
              currency={order.currency}
              methods={order.paymentMethods}
              organizerVerification={order.organizerVerification}
            />
            <p className="text-sm text-muted-foreground">{t("quoteReference", { reference: order.reference })}</p>
            <DeclarePaymentForm token={token} />
          </>
        ) : null}

        {order.status === "DECLARED" ? (
          <p className="rounded-lg border px-4 py-3 text-sm">
            {t("declaredText", { reference: order.paymentReference ?? "" })}
          </p>
        ) : null}

        {order.status === "PAID" ? (
          <section className="flex flex-col gap-3">
            <p className="text-sm">{t("paidText")}</p>
            <ul className="flex flex-col gap-2">
              {order.ticketTokens.map((ticket, index) => (
                <li key={ticket}>
                  <Button asChild variant="outline" className="w-full justify-start gap-2">
                    <Link href={ticketRoute(ticket)}>
                      <Ticket aria-hidden className="size-4" />
                      {t("ticket", { number: index + 1 })}
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">{t("transferHint")}</p>
          </section>
        ) : null}

        {order.status === "EXPIRED" ? <p className="rounded-lg border px-4 py-3 text-sm">{t("expiredText")}</p> : null}

        {order.status === "REJECTED" ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {t("rejectedText", { reason: order.rejectionReason ?? "" })}
          </p>
        ) : null}

        <p className="text-center text-xs text-muted-foreground">{t("keepLink")}</p>
      </div>
    </div>
  );
}
