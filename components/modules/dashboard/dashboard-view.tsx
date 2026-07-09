import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { EventDashboard } from "@/components/modules/dashboard/event-dashboard";
import { serverFetch } from "@/lib/api-server";
import { eventGuestsExportRoute, eventGuestsRoute } from "@/lib/constants";
import type { DashboardData } from "@/components/modules/dashboard/schema";
import { StateMessage } from "@/components/shared/state-message";

/** Live event dashboard: server-rendered snapshot, then client polling. */
export async function DashboardView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await serverFetch(`/events/${id}/dashboard`);

  if (!response.ok) {
    return (
      <StateMessage
        title="Dashboard unavailable"
        description="We couldn't load this event's metrics. Please try again."
      />
    );
  }

  const data = (await response.json()) as DashboardData;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{data.eventName}</h1>
          <Badge variant="secondary">{data.eventStatus}</Badge>
        </div>
        <ButtonGroup>
          <Button variant="outline" asChild>
            <a href={eventGuestsExportRoute(id)} download>
              Export guest list
            </a>
          </Button>
          <Button variant="outline" asChild>
            <Link href={eventGuestsRoute(id)}>Guests</Link>
          </Button>
        </ButtonGroup>
      </div>

      <div className="mt-8">
        <EventDashboard eventId={id} initial={data} />
      </div>
    </div>
  );
}
