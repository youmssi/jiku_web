import type { ReactNode } from "react";
import { getFormatter, getTranslations } from "next-intl/server";
import { CalendarDays, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { StateMessage } from "@/components/shared/state-message";
import { ROUTES } from "@/lib/constants";
import { EventActions } from "./event-actions";
import { EventStatusBadge } from "./event-status-badge";
import { EventTabs } from "./event-tabs";
import { loadEvent, loadPublishChecklist } from "./event.queries";
import type { EventResponse } from "./schema";

/**
 * The frame around every tab of one event: its name, status, date and place,
 * the lifecycle actions, then the tab bar. An event that does not exist in the
 * active organization, or cannot be read, gets a clear way back instead.
 */
export async function EventWorkspace({ eventId, children }: { eventId: string; children: ReactNode }) {
  const [load, t] = await Promise.all([loadEvent(eventId), getTranslations("events")]);
  if (load.kind !== "ok") {
    const key = load.kind === "not-found" ? "notFound" : "loadFailed";
    return (
      <StateMessage
        title={t(`${key}.title`)}
        description={t(`${key}.description`)}
        action={
          <Button asChild variant="outline">
            <Link href={ROUTES.EVENTS}>{t("backToEvents")}</Link>
          </Button>
        }
      />
    );
  }
  const { event } = load;
  const checklist = event.status === "DRAFT" ? await loadPublishChecklist(event) : null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-semibold tracking-tight">{event.name}</h1>
              <EventStatusBadge status={event.status} />
            </div>
            <EventWhenWhere event={event} />
          </div>
          <EventActions eventId={event.id} status={event.status} checklist={checklist} />
        </div>
        <EventTabs eventId={event.id} />
      </header>
      {children}
    </div>
  );
}

async function EventWhenWhere({ event }: { event: EventResponse }) {
  const [t, format] = await Promise.all([getTranslations("events.header"), getFormatter()]);
  const when = event.startDateTime
    ? format.dateTime(new Date(event.startDateTime), {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: event.timezone,
      })
    : t("undated");
  return (
    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1.5 first-letter:uppercase">
        <CalendarDays className="size-4" aria-hidden />
        {when}
      </span>
      {event.location ? (
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-4" aria-hidden />
          {event.location}
        </span>
      ) : null}
    </p>
  );
}
