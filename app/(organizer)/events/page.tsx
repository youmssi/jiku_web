import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { serverFetch } from "@/lib/api-server";
import { ROUTES, eventEditRoute } from "@/lib/constants";

interface EventListItem {
  id: string;
  name: string;
  status: string;
  startDateTime: string | null;
  timezone: string;
  location: string | null;
}

function formatStart(event: EventListItem): string {
  if (!event.startDateTime) {
    return "No date set";
  }
  const formatted = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: event.timezone,
  }).format(new Date(event.startDateTime));
  return `${formatted} (${event.timezone})`;
}

export default async function EventsPage() {
  const response = await serverFetch("/events");
  if (response.status === 401) {
    redirect(ROUTES.LOGIN);
  }
  const events = response.ok ? ((await response.json()) as EventListItem[]) : [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Events</h1>
        <Button asChild>
          <Link href={ROUTES.EVENTS_NEW}>New event</Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          No events yet. Create your first one to start inviting guests.
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {events.map((event) => (
            <Link key={event.id} href={eventEditRoute(event.id)} className="block">
              <Card className="transition-colors hover:bg-accent">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{event.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{formatStart(event)}</p>
                  </div>
                  <Badge
                    variant={
                      event.status === "PUBLISHED"
                        ? "default"
                        : event.status === "CANCELLED"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {event.status}
                  </Badge>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
