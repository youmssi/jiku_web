"use client";

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

/**
 * The guest's digital ticket. The QR is rendered client-side as an SVG from the
 * ticket code already fetched, so once this view is on screen it needs no network
 * to keep displaying — the guest can screenshot it and present it at check-in
 * (JIKU-21). The QR encodes the raw ticket code the validator scans (JIKU-22).
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
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div
        className="px-6 py-4 text-center text-white"
        style={{ backgroundColor: primaryColor }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={organizerName}
            className="mx-auto mb-2 h-9 object-contain"
          />
        ) : null}
        <p className="text-sm opacity-90">{organizerName}</p>
        <h1 className="mt-0.5 text-lg font-semibold">{eventName}</h1>
      </div>

      <div className="flex flex-col items-center px-6 py-6">
        <div className="rounded-xl bg-white p-4">
          <QRCodeSVG
            value={ticketCode}
            size={232}
            level="M"
            marginSize={0}
            className="h-auto w-full max-w-[232px]"
          />
        </div>
        <p className="mt-3 text-sm font-medium">{guestName}</p>
        <p className="mt-2 select-all rounded-md bg-muted px-3 py-1.5 font-mono text-xs tracking-wider">
          {ticketCode}
        </p>

        <div className="mt-4 w-full space-y-1 border-t pt-4 text-center text-sm text-muted-foreground">
          {eventWhen ? <p>📅 {eventWhen}</p> : null}
          {eventLocation ? <p>📍 {eventLocation}</p> : null}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Save or screenshot this ticket. It works offline and you can show it at
          the entrance.
        </p>
      </div>
    </div>
  );
}
