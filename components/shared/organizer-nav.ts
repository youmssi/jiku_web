import { CalendarDays, CreditCard, LayoutDashboard, Settings, Users } from "lucide-react";
import {
  billingRoute,
  eventDashboardRoute,
  eventEditRoute,
  eventGuestsRoute,
  ROUTES,
} from "@/lib/constants";

export interface OrganizerNavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  match: (pathname: string) => boolean;
}

/**
 * Single source of truth for the organizer app's top-level sections, consumed
 * by both the desktop sidebar and the mobile bottom tab bar so they can never
 * drift out of sync.
 */
export const ORGANIZER_NAV_ITEMS: OrganizerNavItem[] = [
  {
    label: "Home",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    match: (pathname) => pathname === ROUTES.DASHBOARD,
  },
  {
    label: "Events",
    href: ROUTES.EVENTS,
    icon: CalendarDays,
    match: (pathname) => pathname === ROUTES.EVENTS || pathname.startsWith(`${ROUTES.EVENTS}/`),
  },
  {
    label: "Billing",
    href: ROUTES.BILLING,
    icon: CreditCard,
    match: (pathname) => pathname === ROUTES.BILLING || pathname.startsWith(`${ROUTES.BILLING}/`),
  },
  {
    label: "Settings",
    href: ROUTES.SETTINGS,
    icon: Settings,
    match: (pathname) => pathname === ROUTES.SETTINGS || pathname.startsWith(`${ROUTES.SETTINGS}/`),
  },
];

export interface EventSubNavItem {
  label: string;
  href: (eventId: string) => string;
  icon: typeof LayoutDashboard;
  match: (pathname: string, eventId: string) => boolean;
}

/**
 * Sub-navigation for one selected event, shown as a SidebarMenuSub under "Events"
 * on desktop (expand-in-place) and as a horizontal EventSubNav strip on every
 * per-event page (desktop + mobile, since the sidebar's sub-menu has no mobile
 * equivalent under the bottom-tab-bar nav strategy).
 */
export const EVENT_SUB_NAV_ITEMS: EventSubNavItem[] = [
  {
    label: "Dashboard",
    href: eventDashboardRoute,
    icon: LayoutDashboard,
    match: (pathname, eventId) => pathname === eventDashboardRoute(eventId),
  },
  {
    label: "Guests",
    href: eventGuestsRoute,
    icon: Users,
    match: (pathname, eventId) => pathname === eventGuestsRoute(eventId),
  },
  {
    label: "Billing",
    href: billingRoute,
    icon: CreditCard,
    match: (pathname, eventId) => pathname === billingRoute(eventId),
  },
  {
    label: "Settings",
    href: eventEditRoute,
    icon: Settings,
    match: (pathname, eventId) => pathname === eventEditRoute(eventId),
  },
];

/** Extracts the event id from a pathname like `/events/{id}/...`, or null outside that shape. */
export function currentEventId(pathname: string): string | null {
  const match = pathname.match(/^\/events\/([^/]+)(?:\/|$)/);
  const id = match?.[1];
  if (!id || id === "new") return null;
  return id;
}

export function organizerInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("") || "J"
  );
}

export function organizerRoleLabel(role: string): string {
  return role.toLowerCase().replace(/_/g, " ");
}
