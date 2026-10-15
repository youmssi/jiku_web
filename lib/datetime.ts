import { TZDate } from "@date-fns/tz";

function pad(value: number): string {
  return String(value).padStart(2, "0");
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

/**
 * The day of an event, spelled out in the viewer's language and the event's own
 * timezone ("samedi 12 décembre 2026" / "Saturday 12 December 2026").
 */
export function formatEventDay(utcInstant: string, timeZone: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(new Date(utcInstant));
}

/** The time of day of an event in its own timezone, on a 24-hour clock. */
export function formatEventTime(utcInstant: string, timeZone: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).format(new Date(utcInstant));
}

/** The city part of an IANA zone, for a "Conakry time" hint ("Africa/Conakry" → "Conakry"). */
export function zoneCity(timeZone: string): string {
  return (timeZone.split("/").pop() ?? timeZone).replaceAll("_", " ");
}
