/**
 * Curated timezone list for everything an organizer schedules (events,
 * services, resources), the launch market first: Conakry heads the list and is
 * the default, followed by the neighbouring markets organizers most often work
 * in, then the diaspora zones they organize from.
 */
export const TIMEZONES = [
  "Africa/Conakry",
  "Africa/Abidjan",
  "Africa/Dakar",
  "Africa/Accra",
  "Africa/Bamako",
  "Africa/Douala",
  "Africa/Ndjamena",
  "Africa/Lagos",
  "Africa/Casablanca",
  "Africa/Tunis",
  "Europe/Paris",
  "Europe/London",
  "America/New_York",
  "UTC",
] as const;

export const DEFAULT_TIMEZONE = TIMEZONES[0];
