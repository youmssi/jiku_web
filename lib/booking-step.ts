/** The step a service card's link opens on (JIKU-190): `slot` skips the presentation. */
export type BookingStep = "slot";

/** The step named by a `step` parameter, or null for the service's presentation. */
export function bookingStep(value: string | null | undefined): BookingStep | null {
  return value === "slot" ? "slot" : null;
}

/**
 * The calendar day (`YYYY-MM-DD`, in the service's time zone) of the first free
 * time, which a link in slot mode opens on; null when none is free this week.
 */
export function slotStepDay(upcoming: readonly { startsAt: string }[] | null | undefined, timeZone: string): string | null {
  const first = upcoming?.[0];
  if (!first) return null;
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(first.startsAt),
  );
}
