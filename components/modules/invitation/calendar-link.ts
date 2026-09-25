/** How long an event without an end is assumed to last, matching the ticket email's invite. */
const DEFAULT_LENGTH_MS = 2 * 60 * 60 * 1000;

interface CalendarEvent {
  title: string;
  start: string;
  end: string | null;
  location: string | null;
  details: string;
}

function stamp(instant: Date): string {
  return instant.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** A Google Calendar "add event" link, the same one the ticket email carries. */
export function googleCalendarLink(event: CalendarEvent): string {
  const start = new Date(event.start);
  const end = event.end ? new Date(event.end) : new Date(start.getTime() + DEFAULT_LENGTH_MS);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: event.details,
  });
  if (event.location) params.set("location", event.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
