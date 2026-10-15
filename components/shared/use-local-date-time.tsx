"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useLocale } from "next-intl";

const noSubscription = () => () => {};

/**
 * Formats UTC instants in the viewer's language and, once the page has
 * hydrated, the viewer's timezone. The server and the first client render
 * both use UTC, so they print the same text and React never reports a
 * hydration mismatch; the next render switches to the device's clock. For the
 * organizer's own records (payments, invoices, audit) only: anything a guest or
 * door staff sees uses the event's timezone instead.
 */
export function useLocalDateTime(dateOnly = false): (utcInstant: string | null) => string {
  const locale = useLocale();
  const hydrated = useSyncExternalStore(noSubscription, () => true, () => false);
  return useCallback(
    (utcInstant: string | null) => {
      if (!utcInstant) return "";
      return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        ...(dateOnly ? {} : { timeStyle: "short" as const }),
        ...(hydrated ? {} : { timeZone: "UTC" }),
      }).format(new Date(utcInstant));
    },
    [locale, hydrated, dateOnly],
  );
}

/** [useLocalDateTime] as an element, for server-rendered tables and lists. */
export function LocalDateTime({ value }: Readonly<{ value: string | null }>) {
  const format = useLocalDateTime();
  return value ? <time dateTime={value}>{format(value)}</time> : null;
}
