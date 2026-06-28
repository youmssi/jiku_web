import { TZDate } from "@date-fns/tz";

function pad(value: number): string {
  return String(value).padStart(2, "0");
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
