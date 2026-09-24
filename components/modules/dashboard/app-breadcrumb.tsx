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
// Deep import, not the module barrel: the barrel also re-exports server-only
// view components, and pulling that whole graph into this client component's
// bundle drags in server-only code (next/headers) it never needs — the same
// reason admin's TenantCombobox imports its service file directly too.
import { getServiceNameAction } from "@/components/modules/services/services.service";
import {
  currentEventId,
  currentServiceId,
  EVENT_SUB_NAV_ITEMS,
  ORGANIZER_NAV_ITEMS,
  SERVICE_SUB_NAV_ITEMS,
} from "@/components/shared/organizer-nav";
import { eventDashboardRoute, ROUTES, serviceManageRoute } from "@/lib/constants";

interface Crumb {
  label: string;
  href: string;
}

/**
 * Header breadcrumb for the organizer shell: organization, the active
 * top-level section (Events, Services, Billing, …), the open event's or
 * service's name, and the active tab. Matches the sidebar-07 dashboard header
 * pattern. Only the last crumb renders as plain (non-link) current-page text —
 * every earlier one, including the section itself, is a real link — so the
 * section is never both a link two levels up and the current page at once.
 */
export function AppBreadcrumb({ brandName }: { brandName: string }) {
  const pathname = usePathname();
  const eventId = currentEventId(pathname);
  const serviceId = currentServiceId(pathname);
  const active = ORGANIZER_NAV_ITEMS.find((item) => item.match(pathname));
  const eventSub = eventId
    ? EVENT_SUB_NAV_ITEMS.find((item) => item.match(pathname, eventId))
    : null;
  const serviceSub = serviceId
    ? SERVICE_SUB_NAV_ITEMS.find((item) => item.match(pathname, serviceId))
    : null;
  const [itemName, setItemName] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    if (eventId) {
      getEventNameAction(eventId).then((name) => {
        if (!cancelled) setItemName(name);
      });
    } else if (serviceId) {
      getServiceNameAction(serviceId).then((name) => {
        if (!cancelled) setItemName(name);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [eventId, serviceId]);

  const crumbs: Crumb[] = [];
  if (active) {
    crumbs.push({ label: active.label, href: active.href });
  }
  if (eventId) {
    crumbs.push({ label: itemName ?? "Event", href: eventDashboardRoute(eventId) });
  } else if (serviceId) {
    crumbs.push({ label: itemName ?? "Service", href: serviceManageRoute(serviceId) });
  }
  const tabLabel = eventSub?.label ?? serviceSub?.label ?? null;
  if (tabLabel) {
    crumbs.push({ label: tabLabel, href: pathname });
  }
  const lastIndex = crumbs.length - 1;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href={ROUTES.DASHBOARD}>{brandName}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {crumbs.map((crumb, index) => {
          const isLast = index === lastIndex;
          return (
            <React.Fragment key={`${crumb.label}-${index}`}>
              <BreadcrumbSeparator className={isLast ? undefined : "hidden md:block"} />
              <BreadcrumbItem className={isLast ? undefined : "hidden md:block"}>
                {isLast ? (
                  <BreadcrumbPage className="max-w-40 truncate">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href} className="max-w-40 truncate">
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
