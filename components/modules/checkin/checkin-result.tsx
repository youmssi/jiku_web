"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { readableTextColor } from "@/lib/color-contrast";
import { formatAmount } from "@/lib/currency";
import { formatTimeInZone } from "@/lib/datetime";
import type { CheckInOutcome, CheckInResponse } from "@/components/modules/checkin/schema";

type CollectMethod = "MOBILE_MONEY" | "CASH";

interface CheckInResultProps {
  result: CheckInResponse;
  timezone: string;
  onDismiss: () => void;
  /** Records the payment of a PAYMENT_DUE ticket, then checks the guest in. */
  onCollect: (method: CollectMethod) => Promise<void>;
}

interface Style {
  bg: string;
  glyph: string;
}

/**
 * Full-screen, glanceable check-in feedback. High-contrast color + a large glyph
 * convey success/failure at arm's length in bright outdoor or dim venue light; the
 * "already checked in" state names who checked the guest in and when (JIKU-22).
 *
 * La catégorie d'accès (JIKU-93) s'affiche en bandeau sous le nom, pas en fond :
 * le fond reste la couleur du verdict, qui est ce que le portier doit lire en
 * premier. Une catégorie qui prendrait le fond ferait perdre « laisser entrer ou
 * non » au profit de « quelle catégorie », qui vient après.
 *
 * A ticket not paid yet (JIKU-110) stops at the door: the screen shows what is
 * owed and lets the validator record how the guest paid, which checks them in.
 * Any other verdict dismisses with a tap anywhere.
 */
export function CheckInResult({ result, timezone, onDismiss, onCollect }: CheckInResultProps) {
  const t = useTranslations("operator.checkin");
  const c = useTranslations("operator.collect");
  const locale = useLocale();
  const [collecting, setCollecting] = useState(false);
  const style = STYLES[result.outcome];
  const due = result.outcome === "PAYMENT_DUE";

  async function collect(method: CollectMethod) {
    setCollecting(true);
    try {
      await onCollect(method);
    } finally {
      setCollecting(false);
    }
  }

  const body = (
    <>
      <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/20 text-6xl font-bold">
        {style.glyph}
      </div>
      <h2 className="mt-6 text-3xl font-bold">{t(result.outcome)}</h2>
      {result.guestName ? <p className="mt-2 text-2xl font-medium">{result.guestName}</p> : null}

      {result.ticketTypeLabel ? (
        <p
          className="mt-4 rounded-lg px-6 py-2 text-3xl font-bold ring-2 ring-white/60"
          style={{
            backgroundColor: result.ticketTypeColor ?? "#334155",
            color: readableTextColor(result.ticketTypeColor ?? "#334155"),
          }}
        >
          {result.ticketTypeLabel}
        </p>
      ) : null}

      {result.outcome === "ALREADY_CHECKED_IN" && result.checkedInBy ? (
        <p className="mt-3 text-lg text-white/90">
          {result.checkedInAt
            ? t("byAt", { name: result.checkedInBy, time: formatTimeInZone(result.checkedInAt, timezone) })
            : t("by", { name: result.checkedInBy })}
        </p>
      ) : null}
      {result.outcome === "NOT_FOUND" ? <p className="mt-3 text-lg text-white/90">{t("notFound")}</p> : null}
      {result.outcome === "CANCELLED" ? <p className="mt-3 text-lg text-white/90">{t("cancelled")}</p> : null}
      {result.outcome === "EVENT_CANCELLED" ? <p className="mt-3 text-lg text-white/90">{t("eventCancelled")}</p> : null}
      {due ? (
        <p className="mt-3 text-xl font-semibold">
          {result.amountDueMinor != null && result.amountDueCurrency
            ? t("due", { amount: formatAmount(result.amountDueMinor, result.amountDueCurrency, locale) })
            : t("dueNoAmount")}
        </p>
      ) : null}
    </>
  );

  if (due) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed inset-0 z-50 flex w-full flex-col items-center justify-center px-6 text-center text-white ${style.bg}`}
      >
        {body}
        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <Button className="h-12 text-base" onClick={() => void collect("MOBILE_MONEY")} disabled={collecting}>
            {collecting ? c("saving") : c("mobileMoney")}
          </Button>
          <Button className="h-12 text-base" onClick={() => void collect("CASH")} disabled={collecting}>
            {c("cash")}
          </Button>
          <Button variant="secondary" className="h-12 text-base" onClick={onDismiss} disabled={collecting}>
            {t("close")}
          </Button>
        </div>
      </div>
    );
  }

  // Tapping anywhere dismisses, for a validator whose hands are full; the button
  // is the accessible way to do the same.
  return (
    <div
      role="presentation"
      onClick={onDismiss}
      className={`fixed inset-0 z-50 flex w-full cursor-pointer flex-col items-center justify-center px-6 text-center text-white ${style.bg}`}
    >
      {body}
      <Button
        variant="secondary"
        className="mt-10 h-12 px-8 text-base"
        autoFocus
        onClick={(event) => {
          event.stopPropagation();
          onDismiss();
        }}
      >
        {t("next")}
      </Button>
    </div>
  );
}

const STYLES: Record<CheckInOutcome, Style> = {
  CHECKED_IN: { bg: "bg-green-600", glyph: "✓" },
  ALREADY_CHECKED_IN: { bg: "bg-amber-500", glyph: "!" },
  CANCELLED: { bg: "bg-zinc-700", glyph: "✕" },
  EVENT_CANCELLED: { bg: "bg-red-700", glyph: "✕" },
  NOT_FOUND: { bg: "bg-red-600", glyph: "✕" },
  PAYMENT_DUE: { bg: "bg-orange-600", glyph: "$" },
};
