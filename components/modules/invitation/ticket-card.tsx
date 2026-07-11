"use client";

import { useState, type CSSProperties, type MouseEvent } from "react";
import { QRCodeSVG } from "qrcode.react";

interface TicketCardProps {
  ticketCode: string;
  eventName: string;
  eventWhen: string | null;
  eventLocation: string | null;
  organizerName: string;
  primaryColor: string;
  logoUrl: string | null;
  guestName: string;
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
  eventWhen,
  eventLocation,
  organizerName,
  primaryColor,
  logoUrl,
  guestName,
}: TicketCardProps) {
  const [glare, setGlare] = useState<{ x: number; y: number } | null>(null);

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
        className="group relative overflow-hidden rounded-2xl border bg-card shadow-lg shadow-black/5"
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
        </div>

        {/* Perforated divider with side notches, matching the page background. */}
        <div className="relative h-0">
          <div className="absolute -left-3 top-0 size-6 -translate-y-1/2 rounded-full bg-white dark:bg-zinc-900" />
          <div className="absolute -right-3 top-0 size-6 -translate-y-1/2 rounded-full bg-white dark:bg-zinc-900" />
          <div className="absolute inset-x-6 top-0 -translate-y-1/2 border-t-2 border-dashed border-border" />
        </div>

        {/* Scan panel */}
        <div className="relative flex flex-col items-center px-6 pb-6 pt-8">
          <div className="rounded-xl bg-white p-4 shadow-inner ring-1 ring-black/5">
            <QRCodeSVG
              value={ticketCode}
              size={216}
              level="M"
              marginSize={0}
              className="h-auto w-full max-w-[216px]"
            />
          </div>
          <p className="mt-4 font-mono text-sm font-semibold uppercase tracking-wide">{guestName}</p>
          <p className="mt-1.5 select-all rounded-md bg-muted px-3 py-1 font-mono text-xs tracking-wider text-muted-foreground">
            {ticketCode}
          </p>

          {(eventWhen || eventLocation) && (
            <div className="mt-4 w-full space-y-1 border-t pt-4 text-center text-sm text-muted-foreground">
              {eventWhen ? <p>{eventWhen}</p> : null}
              {eventLocation ? <p>{eventLocation}</p> : null}
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Save or screenshot this ticket. It works offline and you can show it at the entrance.
      </p>
    </div>
  );
}
