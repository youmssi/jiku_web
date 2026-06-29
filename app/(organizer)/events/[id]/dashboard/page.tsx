import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventDashboard } from "@/components/modules/organizer/components/event-dashboard";
import { serverFetch } from "@/lib/api-server";
import { eventGuestsExportRoute, eventGuestsRoute } from "@/lib/constants";
import type { DashboardData } from "@/components/modules/organizer/dashboard-types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDashboardPage({ params }: PageProps) {
  const { id } = await params;
  const response = await serverFetch(`/events/${id}/dashboard`);

  if (!response.ok) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <h1 className="text-xl font-semibold">Dashboard unavailable</h1>
        <p className="mt-2 text-muted-foreground">
          We couldn&apos;t load this event&apos;s metrics. Please try again.
        </p>
      </div>
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
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={eventGuestsExportRoute(id)} download>
              Export guest list
            </a>
          </Button>
          <Button variant="outline" asChild>
            <Link href={eventGuestsRoute(id)}>Guests</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <EventDashboard eventId={id} initial={data} />
      </div>
    </div>
  );
}
