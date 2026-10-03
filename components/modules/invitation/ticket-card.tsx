"use client";

import { useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { CardHero, OrganizerMark, QrCode } from "@/components/shared";
import { CARD_STYLE_TOKENS, displayTitle, type CardStyle } from "@/lib/card-style";
import { cn } from "@/lib/utils";

interface TicketCardProps {
  ticketCode: string;
  eventName: string;
  organizerName: string;
  primaryColor: string;
  logoUrl: string | null;
  /** The organizer's style and banner photo (JIKU-194). */
  style: CardStyle;
  bannerUrl: string | null;
  guestName: string;
  categoryName: string | null;
  /** People admitted with the guest on this ticket, from an open invitation (JIKU-184). */
  companions: number;
  /** When the event starts, as an instant, for the `<time>` element. */
  start: string | null;
  /** The stub: "14", "nov.", "19 h – 23 h", in the viewer's language and the event's timezone. */
  day: string | null;
  month: string | null;
  time: string | null;
  /** The date written out in full, for a tooltip and screen readers. */
  whenFull: string | null;
  /** The event's IANA timezone; its city is shown only to a viewer in another zone. */
  timeZone: string | null;
  zoneCity: string | null;
  location: string | null;
  cancelled: boolean;
}

/**
 * The guest's ticket, in the organizer's style (JIKU-194): a status seen from
 * afar, the event over its banner, a dated stub, and the QR code the validator
 * scans (JIKU-22). The QR is drawn from the code already fetched, so the ticket
 * keeps showing without a connection and survives a screenshot (JIKU-21).
 */
export function TicketCard({
  ticketCode,
  eventName,
  organizerName,
  primaryColor,
  logoUrl,
  style,
  bannerUrl,
  guestName,
  categoryName,
  companions,
  start,
  day,
  month,
  time,
  whenFull,
  timeZone,
  zoneCity,
  location,
  cancelled,
}: TicketCardProps) {
  const t = useTranslations("guest.ticket");
  const tokens = CARD_STYLE_TOKENS[style];
  const [codeShown, setCodeShown] = useState(false);
  const viewerZone = useSyncExternalStore(noSubscription, viewerTimeZone, () => null);
  const otherZone = Boolean(start && timeZone && viewerZone && wallClock(start, viewerZone) !== wallClock(start, timeZone));
  const radius = tokens.radius;

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex items-center justify-between print:hidden">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
            cancelled ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800",
          )}
        >
          <span aria-hidden className={cn("size-2 rounded-full", cancelled ? "bg-red-600" : "bg-emerald-600")} />
          {cancelled ? t("statusCancelled") : t("statusValid")}
        </span>
        {categoryName ? (
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{categoryName}</span>
        ) : null}
      </div>

      <div
        className="overflow-hidden shadow-lg shadow-black/10 print:shadow-none"
        style={{ borderRadius: radius, background: tokens.panel, color: tokens.panelInk }}
      >
        <CardHero style={style} color={primaryColor} bannerUrl={bannerUrl}>
          <div className="flex min-h-32 flex-col justify-between gap-5 px-5 pb-5 pt-4">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <OrganizerMark name={organizerName} logoUrl={logoUrl} square={style === "MODERN"} />
              {organizerName}
            </div>
            <h1 className="text-balance" style={displayTitle(tokens, "1.85rem")}>
              {eventName}
            </h1>
          </div>
        </CardHero>

        <div className="flex items-center gap-4 px-5 pb-3 pt-4">
          {day ? (
            <time dateTime={start ?? undefined} title={whenFull ?? undefined} className="flex items-end gap-2">
              <span className="leading-[0.8]" style={{ ...displayTitle(tokens, "2.9rem"), textTransform: "none" }}>
                {day}
              </span>
              <span className="flex flex-col text-[11px] font-bold uppercase leading-tight tracking-wider">
                {month}
                <span className="font-medium normal-case tracking-normal" style={{ color: tokens.panelMuted }}>
                  {time}
                </span>
              </span>
            </time>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold" title={guestName}>
              {companions > 0 ? t("guestWith", { name: guestName, count: companions }) : guestName}
            </p>
            {location ? (
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs" style={{ color: tokens.panelMuted }}>
                <MapPin aria-hidden className="size-3 shrink-0" />
                {location}
              </p>
            ) : null}
            {otherZone ? (
              <p className="mt-0.5 text-xs" style={{ color: tokens.panelMuted }}>
                {t("timezone", { zone: zoneCity ?? "" })}
              </p>
            ) : null}
          </div>
        </div>

        <div aria-hidden className="relative h-5">
          <div className="absolute inset-x-5 top-1/2 border-t-2 border-dashed" style={{ borderColor: `color-mix(in srgb, ${tokens.panelInk} 18%, transparent)` }} />
          <div className="absolute -left-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-white dark:bg-zinc-900" />
          <div className="absolute -right-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-white dark:bg-zinc-900" />
        </div>

        <div className="flex flex-col items-center gap-3 px-5 pb-5 pt-2">
          <div className={cn("bg-white p-3", cancelled && "opacity-30 grayscale")} style={{ borderRadius: Math.max(8, radius * 0.6) }}>
            <QrCode value={ticketCode} quiet={0} className="h-auto w-full max-w-[208px]" />
          </div>
          {codeShown ? (
            <p className="select-all rounded-md bg-white px-2 py-0.5 font-mono text-xs tracking-wider">{ticketCode}</p>
          ) : (
            <button
              type="button"
              onClick={() => setCodeShown(true)}
              className="text-xs underline underline-offset-4 print:hidden"
              style={{ color: tokens.panelMuted }}
            >
              {t("showCode")}
            </button>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground print:hidden">{t("offline")}</p>
    </div>
  );
}

function noSubscription() {
  return () => {};
}

function viewerTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** The date and time [instant] shows in [timeZone]: two zones that show the same need no hint. */
function wallClock(instant: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "short", timeStyle: "short", timeZone }).format(new Date(instant));
}
