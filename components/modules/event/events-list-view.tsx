import { getTranslations } from "next-intl/server";
import { CalendarDays } from "lucide-react";
import { localeRedirect } from "@/i18n/redirect";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { reportApiError } from "@/lib/action-result";
import { serverFetch } from "@/lib/api-server";
import { ROUTES } from "@/lib/constants";
import type { EventListItem } from "@/components/modules/event/schema";
import { EventsTable } from "@/components/modules/event/events-table";
import { NewEventDialog } from "@/components/modules/event/new-event-dialog";

/** The organizer's events, as a data-table, with an empty state that starts the first one. */
export async function EventsListView() {
  const [response, t] = await Promise.all([serverFetch("/events"), getTranslations("events.list")]);
  if (response.status === 401) {
    return localeRedirect(ROUTES.LOGIN);
  }
  if (!response.ok) reportApiError(response, "event");
  const events = response.ok ? ((await response.json()) as EventListItem[]) : [];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <NewEventDialog />
      </div>

      {events.length === 0 ? (
        <Empty className="mt-10 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarDays />
            </EmptyMedia>
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <NewEventDialog />
          </EmptyContent>
        </Empty>
      ) : (
        <div className="mt-2">
          <EventsTable events={events} />
        </div>
      )}
    </div>
  );
}
