"use client";

import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link, usePathname } from "@/i18n/navigation";
import { getEventNameAction } from "./dashboard.service";
import {
  currentEventId,
  EVENT_SUB_NAV_ITEMS,
  ORGANIZER_NAV_ITEMS,
} from "@/components/shared/organizer-nav";
import { eventDashboardRoute, ROUTES } from "@/lib/constants";

/**
 * Header breadcrumb for the organizer shell: organization, section (Events),
 * the open event's name, and the active view. Matches the sidebar-07 dashboard
 * header pattern. The event name is loaded through the event service layer.
 */
export function AppBreadcrumb({ brandName }: { brandName: string }) {
  const pathname = usePathname();
  const eventId = currentEventId(pathname);
  const active = ORGANIZER_NAV_ITEMS.find((item) => item.match(pathname));
  const sub = eventId
    ? EVENT_SUB_NAV_ITEMS.find((item) => item.match(pathname, eventId))
    : null;
  const [eventName, setEventName] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    if (eventId) {
      getEventNameAction(eventId).then((name) => {
        if (!cancelled) {
          setEventName(name);
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const section = sub?.label ?? active?.label ?? "Dashboard";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href={ROUTES.DASHBOARD}>{brandName}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href={ROUTES.EVENTS}>Events</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {eventId ? (
          <>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link
                  href={eventDashboardRoute(eventId)}
                  className="max-w-40 truncate"
                >
                  {eventName ?? "Event"}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        ) : null}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{section}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
