"use client";

import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { formatAmount } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { AppointmentLinkRef } from "@/components/modules/appointment/appointment.service";
import { lineTakePath } from "@/components/modules/appointment/line-paths";
import type { ClientLineTicketView } from "@/components/modules/appointment/schema";
import { useLineTicket } from "@/components/modules/appointment/useLineTicket";

/**
 * A client's ticket page (JIKU-113): their number, how many clients are still
 * ahead and the estimated wait, then, once called, the counter to go to. It
 * refreshes by itself; nothing about the other clients is shown.
 */
export function LineTicketStatus({
  link,
  ticketCode,
  initial,
}: {
  link: AppointmentLinkRef;
  ticketCode: string;
  initial: ClientLineTicketView | null;
}) {
  const t = useTranslations("guest.line.status");
  const locale = useLocale();
  const ticket = useLineTicket(link, ticketCode, initial);

  if (!ticket) {
    return (
      <Shell>
        <p className="text-center text-sm text-muted-foreground">{t("gone")}</p>
        <Button asChild variant="outline" className="w-full rounded-full">
          <Link href={lineTakePath(link)}>{t("newTicket")}</Link>
        </Button>
      </Shell>
    );
  }

  const called = ticket.status === "CALLED";
  const amount =
    ticket.amountDueMinor != null && ticket.amountDueCurrency
      ? formatAmount(ticket.amountDueMinor, ticket.amountDueCurrency, locale)
      : null;

  return (
    <Shell>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{t("title")}</p>
        {ticket.dayRank != null ? (
          <p className="mt-1 text-5xl font-bold tabular-nums">{t("number", { rank: ticket.dayRank })}</p>
        ) : (
          <p className="mt-1 font-mono text-sm">{t("code", { code: ticket.ticketCode })}</p>
        )}
      </div>

      <div
        className={cn(
          "rounded-xl border p-5 text-center",
          called && "border-primary bg-primary/10",
        )}
        aria-live="polite"
      >
        {ticket.status === "WAITING" || ticket.status === "ISSUED" ? (
          <>
            <p className="text-lg font-semibold">{t("ahead", { count: ticket.peopleAhead })}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("wait", { minutes: ticket.estimatedWaitMinutes })}</p>
            <p className="mt-3 text-xs text-muted-foreground">{t("appointmentsNote")}</p>
          </>
        ) : null}
        {called ? (
          <>
            <p className="text-2xl font-bold text-primary">{t("called")}</p>
            <p className="mt-1 text-base">
              {ticket.counter ? t("calledCounter", { counter: ticket.counter }) : t("calledNoCounter")}
            </p>
          </>
        ) : null}
        {ticket.status === "IN_SERVICE" ? <p className="text-lg font-semibold">{t("inService")}</p> : null}
        {ticket.status === "DONE" ? <p className="text-lg font-semibold">{t("done")}</p> : null}
        {ticket.status === "NO_SHOW" ? <p className="text-sm">{t("noShow")}</p> : null}
      </div>

      {ticket.paymentStatus !== "NOT_REQUIRED" && amount ? (
        <div className="flex items-center justify-center gap-2 text-sm">
          {ticket.paymentStatus === "PAID" ? (
            <Badge variant="secondary">{t("paid")}</Badge>
          ) : (
            <span className="font-medium">
              {ticket.paymentStatus === "DUE_AFTER_SERVICE" ? t("dueAfter", { amount }) : t("due", { amount })}
            </span>
          )}
        </div>
      ) : null}

      {ticket.status === "NO_SHOW" ? (
        <Button asChild variant="outline" className="w-full rounded-full">
          <Link href={lineTakePath(link)}>{t("newTicket")}</Link>
        </Button>
      ) : ticket.status !== "DONE" ? (
        <p className="text-center text-xs text-muted-foreground">{t("keepOpen")}</p>
      ) : null}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardContent className="flex flex-col gap-5 pt-6">{children}</CardContent>
      </Card>
    </div>
  );
}
