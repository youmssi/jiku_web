"use client";

import { useState, useSyncExternalStore, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import { CalendarDays, MapPin, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface TicketCardProps {
  ticketCode: string;
  eventName: string;
  organizerName: string;
  primaryColor: string;
  logoUrl: string | null;
  guestName: string;
  categoryName: string | null;
  /** People admitted with the guest on this ticket, from an open invitation (JIKU-184). */
  companions: number;
  /** When the event starts, as an instant, for the `<time>` element. */
  start: string | null;
  /** The day and time, short ("sam. 14 nov. · 19 h – 23 h"), in the viewer's language and the event's timezone. */
  when: string | null;
  /** The same, written out in full, for a tooltip and screen readers. */
  whenFull: string | null;
  /** The event's IANA timezone; its city is shown only to a viewer in another zone. */
  timeZone: string | null;
  /** The city of [timeZone] ("Conakry"). */
  zoneCity: string | null;
  location: string | null;
  cancelled: boolean;
}

/** Mixes a hex color toward black by `amount` (0-1), for the header's gradient depth. */
function darken(hex: string, amount: number): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return hex;
  const n = parseInt(match[1], 16);
  const channel = (shift: number) => Math.round(((n >> shift) & 0xff) * (1 - amount));
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

/**
 * The guest's digital ticket. The QR is rendered client-side as an SVG from the
 * ticket code already fetched, so once this view is on screen it needs no network
 * to keep displaying — the guest can screenshot it and present it at check-in
 * (JIKU-21). The QR encodes the raw ticket code the validator scans (JIKU-22).
 *
 * Styled as a badge/boarding-pass: a perforated divider (with cutout notches)
 * separates the branded header from the scan panel, echoing a physical event
 * pass without any 3D/canvas dependency — the page still has to render
 * instantly offline and be screenshot-friendly.
 */
export function TicketCard({
  ticketCode,
  eventName,
  organizerName,
  primaryColor,
  logoUrl,
  guestName,
  categoryName,
  companions,
  start,
  when,
  whenFull,
  timeZone,
  zoneCity,
  location,
  cancelled,
}: TicketCardProps) {
  const t = useTranslations("guest.ticket");
  const [glare, setGlare] = useState<{ x: number; y: number } | null>(null);
  const [codeShown, setCodeShown] = useState(false);
  const viewerZone = useSyncExternalStore(noSubscription, viewerTimeZone, () => null);
  const otherZone = Boolean(start && timeZone && viewerZone && wallClock(start, viewerZone) !== wallClock(start, timeZone));

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setGlare({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  }

  const headerStyle: CSSProperties = {
    backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${darken(primaryColor, 0.55)})`,
  };
  const glareStyle: CSSProperties = glare
    ? {
        opacity: 1,
        background: `radial-gradient(280px circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.16), transparent 65%)`,
      }
    : { opacity: 0 };

  return (
    <div className="w-full max-w-sm">
      <div
        className="group relative overflow-hidden rounded-2xl border bg-card shadow-lg shadow-black/5 print:shadow-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setGlare(null)}
      >
        {/* Cursor-tracking glare — a no-op on touch devices, a quiet premium cue on desktop. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
          style={glareStyle}
        />
        {/* One-time shine sweep on mount. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          <div className="animate-ticket-shine absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        </div>

        {/* Header */}
        <div className="relative px-6 py-5 text-center text-white" style={headerStyle}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={organizerName}
              className="mx-auto mb-2 h-9 object-contain drop-shadow"
            />
          ) : null}
          <p className="text-xs font-medium uppercase tracking-[0.2em] opacity-80">{organizerName}</p>
          <h1 className="mt-1 text-balance text-xl font-bold tracking-tight">{eventName}</h1>
          {categoryName ? (
            <span className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider ring-1 ring-white/30">
              {categoryName}
            </span>
          ) : null}
        </div>

        {/* Perforated divider with side notches, matching the page background. */}
        <div className="relative h-0">
          <div className="absolute -left-3 top-0 size-6 -translate-y-1/2 rounded-full bg-white dark:bg-zinc-900" />
          <div className="absolute -right-3 top-0 size-6 -translate-y-1/2 rounded-full bg-white dark:bg-zinc-900" />
          <div className="absolute inset-x-6 top-0 -translate-y-1/2 border-t-2 border-dashed border-border" />
        </div>

        {/* Details, laid out like a pass: who, when, where, each behind its icon. */}
        <ul className="flex flex-col gap-2.5 px-6 pt-7 text-sm">
          <Detail icon={UserRound} label={t("guest")}>
            {companions > 0 ? t("guestWith", { name: guestName, count: companions }) : guestName}
          </Detail>
          {when && start ? (
            <Detail icon={CalendarDays} label={t("date")}>
              <time dateTime={start} title={whenFull ?? undefined} className="first-letter:uppercase">
                {when}
              </time>
              {otherZone ? <span className="block text-xs font-normal text-muted-foreground">{t("timezone", { zone: zoneCity ?? "" })}</span> : null}
            </Detail>
          ) : null}
          {location ? (
            <Detail icon={MapPin} label={t("place")}>
              {location}
            </Detail>
          ) : null}
        </ul>

        {/* Scan panel */}
        <div className="relative flex flex-col items-center px-6 pb-6 pt-6">
          <div
            className={cn(
              "rounded-xl bg-white p-4 shadow-inner ring-1 ring-black/5",
              cancelled && "opacity-30 grayscale",
            )}
          >
            <QRCodeSVG
              value={ticketCode}
              size={216}
              level="M"
              marginSize={0}
              className="h-auto w-full max-w-[216px]"
            />
          </div>
          {codeShown ? (
            <p className="mt-3 select-all rounded-md bg-muted px-2 py-0.5 font-mono text-xs tracking-wider">{ticketCode}</p>
          ) : (
            <button
              type="button"
              onClick={() => setCodeShown(true)}
              className="mt-3 text-xs text-muted-foreground underline underline-offset-4 print:hidden"
            >
              {t("showCode")}
            </button>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground print:hidden">
        {t("offline")}
      </p>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof CalendarDays;
  label: string;
  children: ReactNode;
}) {
  return (
    <li className="flex min-w-0 items-start gap-2.5">
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <span className="sr-only">{label} : </span>
      <span className="min-w-0 font-semibold">{children}</span>
    </li>
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
