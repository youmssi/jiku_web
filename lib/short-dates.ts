// Short, glanceable dates and times (JIKU-188): "sam. 14 nov. · 19 h" rather
// than "samedi 14 novembre 2026 · 19:00". Always written in the event's own
// timezone and the viewer's language. The long form stays available through
// `fullWhen`, for tooltips and screen readers.

const DAY_MS = 24 * 60 * 60 * 1000;
/** Beyond this many days ahead, the year is written out. */
const YEAR_SHOWN_AFTER_DAYS = 330;
/** Within this many days, a live page says "Tomorrow" or "In 3 days". */
const RELATIVE_WITHIN_DAYS = 6;

interface CalendarDay {
  year: number;
  month: number;
  day: number;
}

function calendarDay(instant: Date, timeZone: string): CalendarDay {
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone,
  }).formatToParts(instant);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day") };
}

/** Whole days from [now]'s calendar day to [instant]'s, both read in [timeZone]. */
function daysBetween(now: Date, instant: Date, timeZone: string): number {
  const from = calendarDay(now, timeZone);
  const to = calendarDay(instant, timeZone);
  return Math.round((Date.UTC(to.year, to.month - 1, to.day) - Date.UTC(from.year, from.month - 1, from.day)) / DAY_MS);
}

function withYear(instant: Date, timeZone: string, now: Date): boolean {
  const days = daysBetween(now, instant, timeZone);
  return days > YEAR_SHOWN_AFTER_DAYS || calendarDay(instant, timeZone).year < calendarDay(now, timeZone).year;
}

/** "sam. 14 nov." / "Sat, Nov 14", with the year only when it is not obvious. */
export function shortDay(
  utcInstant: string,
  timeZone: string,
  locale: string,
  options: { weekday?: boolean; now?: Date } = {},
): string {
  const instant = new Date(utcInstant);
  const now = options.now ?? new Date();
  return new Intl.DateTimeFormat(locale, {
    weekday: options.weekday === false ? undefined : "short",
    day: "numeric",
    month: "short",
    year: withYear(instant, timeZone, now) ? "numeric" : undefined,
    timeZone,
  }).format(instant);
}

/** "19 h", "19 h 30" in French; "7 PM", "7:30 PM" in English. */
export function shortTime(utcInstant: string, timeZone: string, locale: string): string {
  const instant = new Date(utcInstant);
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).formatToParts(instant);
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);
  if (locale.startsWith("fr")) {
    return minute === 0 ? `${hour} h` : `${hour} h ${String(minute).padStart(2, "0")}`;
  }
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: minute === 0 ? undefined : "2-digit",
    hour12: true,
    timeZone,
  }).format(instant);
}

/** "sam. 14 nov. · 19 h": a day and a time on one line, for visuals that stay fixed. */
export function shortWhen(
  utcInstant: string,
  timeZone: string,
  locale: string,
  options: { weekday?: boolean; now?: Date } = {},
): string {
  return `${shortDay(utcInstant, timeZone, locale, options)} · ${shortTime(utcInstant, timeZone, locale)}`;
}

/**
 * "Aujourd'hui", "Demain", "Dans 3 jours" within the coming days, else null.
 * Only for live pages: an image shared today would be wrong tomorrow.
 */
export function relativeDay(utcInstant: string, timeZone: string, locale: string, now: Date = new Date()): string | null {
  const days = daysBetween(now, new Date(utcInstant), timeZone);
  if (days < 0 || days > RELATIVE_WITHIN_DAYS) return null;
  const text = new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(days, "day");
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}

/** The day for a live page: relative when close, short otherwise, with the time. */
export function liveWhen(utcInstant: string, timeZone: string, locale: string, now: Date = new Date()): string {
  const day = relativeDay(utcInstant, timeZone, locale, now) ?? shortDay(utcInstant, timeZone, locale, { now });
  return `${day} · ${shortTime(utcInstant, timeZone, locale)}`;
}

/** The full date and time, for a tooltip or a screen reader. */
export function fullWhen(utcInstant: string, timeZone: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "short",
    timeZone,
  }).format(new Date(utcInstant));
}
