import { TZDate } from "@date-fns/tz";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * Formats a UTC ISO instant for display in the given event timezone (never the
 * viewer's). Returns an empty string for null input.
 */
export function formatDateTimeInZone(utcInstant: string | null, timeZone: string): string {
  if (!utcInstant) {
    return "";
  }
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(new Date(utcInstant));
}

/**
 * Formats a UTC ISO instant in the viewer's own locale and timezone. Only for
 * organizer-facing convenience data (their own payments, send timestamps) —
 * anything a guest or validator sees must use the event-timezone formatters.
 */
export function formatLocalDateTime(utcInstant: string | null): string {
  if (!utcInstant) {
    return "";
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(utcInstant));
}

/** Formats just the time-of-day of a UTC instant in the given event timezone. */
export function formatTimeInZone(utcInstant: string | null, timeZone: string): string {
  if (!utcInstant) {
    return "";
  }
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(new Date(utcInstant));
}

/**
 * Converts a `datetime-local` value (a wall-clock with no zone), interpreted in
 * the given IANA timezone, to a UTC ISO instant. Returns null for empty input.
 */
export function localInputToUtc(localValue: string, timeZone: string): string | null {
  if (!localValue) {
    return null;
  }
  const [datePart, timePart] = localValue.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const zoned = new TZDate(year, month - 1, day, hour, minute, 0, timeZone);
  return zoned.toISOString();
}

/**
 * Converts a UTC ISO instant to a `datetime-local` wall-clock value
 * (`yyyy-MM-ddTHH:mm`) in the given IANA timezone.
 */
export function utcToLocalInput(utcInstant: string | null, timeZone: string): string {
  if (!utcInstant) {
    return "";
  }
  const zoned = new TZDate(new Date(utcInstant), timeZone);
  return (
    `${zoned.getFullYear()}-${pad(zoned.getMonth() + 1)}-${pad(zoned.getDate())}` +
    `T${pad(zoned.getHours())}:${pad(zoned.getMinutes())}`
  );
}
