"use client";

import { Button } from "@/components/ui/button";
import { formatTimeInZone } from "@/lib/datetime";
import type { CheckInResponse } from "@/components/modules/checkin/schema";

interface CheckInResultProps {
  result: CheckInResponse;
  timezone: string;
  onDismiss: () => void;
}

interface Style {
  bg: string;
  glyph: string;
  title: string;
}

/**
 * Full-screen, glanceable check-in feedback. High-contrast color + a large glyph
 * convey success/failure at arm's length in bright outdoor or dim venue light; the
 * "already checked in" state names who checked the guest in and when (JIKU-22).
 */
export function CheckInResult({ result, timezone, onDismiss }: CheckInResultProps) {
  const style = STYLES[result.outcome];

  return (
    <button
      type="button"
      onClick={onDismiss}
      className={`fixed inset-0 z-50 flex w-full cursor-pointer flex-col items-center justify-center px-6 text-center text-white ${style.bg}`}
    >
      <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/20 text-6xl font-bold">
        {style.glyph}
      </div>
      <h2 className="mt-6 text-3xl font-bold">{style.title}</h2>
      {result.guestName ? (
        <p className="mt-2 text-2xl font-medium">{result.guestName}</p>
      ) : null}

      {result.outcome === "ALREADY_CHECKED_IN" && result.checkedInBy ? (
        <p className="mt-3 text-lg text-white/90">
          by {result.checkedInBy}
          {result.checkedInAt
            ? ` at ${formatTimeInZone(result.checkedInAt, timezone)}`
            : ""}
        </p>
      ) : null}

      {result.outcome === "NOT_FOUND" ? (
        <p className="mt-3 text-lg text-white/90">
          No matching ticket. Try searching by name instead.
        </p>
      ) : null}

      {result.outcome === "CANCELLED" ? (
        <p className="mt-3 text-lg text-white/90">
          This ticket was cancelled: the guest declined.
        </p>
      ) : null}

      {result.outcome === "EVENT_CANCELLED" ? (
        <p className="mt-3 text-lg text-white/90">
          This event has been cancelled: no ticket is valid for entry.
        </p>
      ) : null}

      <Button
        variant="secondary"
        className="mt-10 h-12 px-8 text-base"
        onClick={onDismiss}
      >
        Scan next
      </Button>
    </button>
  );
}

const STYLES: Record<CheckInResponse["outcome"], Style> = {
  CHECKED_IN: { bg: "bg-green-600", glyph: "✓", title: "Checked in" },
  ALREADY_CHECKED_IN: { bg: "bg-amber-500", glyph: "!", title: "Already checked in" },
  CANCELLED: { bg: "bg-zinc-700", glyph: "✕", title: "Ticket cancelled" },
  EVENT_CANCELLED: { bg: "bg-red-700", glyph: "✕", title: "Event cancelled" },
  NOT_FOUND: { bg: "bg-red-600", glyph: "✕", title: "Not found" },
};
