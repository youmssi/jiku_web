import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { serverFetch } from "@/lib/api-server";
import { ROUTES } from "@/lib/constants";
import type { EventListItem } from "@/components/modules/event/schema";
import { EventsTable } from "@/components/modules/event/events-table";
import { NewEventDialog } from "@/components/modules/event/new-event-dialog";

/** Organizer's event list, rendered as a data-table with an Empty state. */
export async function EventsListView() {
  const response = await serverFetch("/events");
  if (response.status === 401) {
    redirect(ROUTES.LOGIN);
  }
  const events = response.ok ? ((await response.json()) as EventListItem[]) : [];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Events</h1>
        <NewEventDialog />
      </div>

      {events.length === 0 ? (
        <Empty className="mt-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarDays />
            </EmptyMedia>
            <EmptyTitle>No events yet</EmptyTitle>
            <EmptyDescription>
              Create your first event to start inviting guests.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <NewEventDialog />
          </EmptyContent>
        </Empty>
      ) : (
        <div className="mt-6">
          <EventsTable events={events} />
        </div>
      )}
    </div>
  );
}
