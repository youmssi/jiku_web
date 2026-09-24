import type { Messages } from "@/i18n/messages";
import { CalendarDays, ClipboardList, CreditCard, LayoutDashboard, ListOrdered, Settings, Users } from "lucide-react";
import {
  billingRoute,
  eventDashboardRoute,
  eventEditRoute,
  eventGuestsRoute,
  ROUTES,
  serviceConfigurationRoute,
  serviceLineRoute,
  serviceManageRoute,
} from "@/lib/constants";

/** A key of the `shell.nav` catalog: nav labels are translated where they render. */
export type NavLabelKey = keyof Messages["shell"]["nav"];

export interface OrganizerNavItem {
  labelKey: NavLabelKey;
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
    labelKey: "home",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    match: (pathname) => pathname === ROUTES.DASHBOARD,
  },
  {
    labelKey: "events",
    href: ROUTES.EVENTS,
    icon: CalendarDays,
    match: (pathname) => pathname === ROUTES.EVENTS || pathname.startsWith(`${ROUTES.EVENTS}/`),
  },
  {
    labelKey: "services",
    href: ROUTES.SERVICES,
    icon: ClipboardList,
    match: (pathname) => pathname === ROUTES.SERVICES || pathname.startsWith(`${ROUTES.SERVICES}/`),
  },
  {
    labelKey: "billing",
    href: ROUTES.BILLING,
    icon: CreditCard,
    match: (pathname) => pathname === ROUTES.BILLING || pathname.startsWith(`${ROUTES.BILLING}/`),
  },
  {
    labelKey: "settings",
    href: ROUTES.SETTINGS,
    icon: Settings,
    match: (pathname) => pathname === ROUTES.SETTINGS || pathname.startsWith(`${ROUTES.SETTINGS}/`),
  },
];

export interface EventSubNavItem {
  labelKey: NavLabelKey;
  href: (eventId: string) => string;
  icon: typeof LayoutDashboard;
  match: (pathname: string, eventId: string) => boolean;
}

/**
 * Sub-navigation for one selected event, shown as a SidebarMenuSub under "Events"
 * in the app sidebar (desktop and the mobile sheet) and used to label the header
 * breadcrumb's current section.
 */
export const EVENT_SUB_NAV_ITEMS: EventSubNavItem[] = [
  {
    labelKey: "dashboard",
    href: eventDashboardRoute,
    icon: LayoutDashboard,
    match: (pathname, eventId) => pathname === eventDashboardRoute(eventId),
  },
  {
    labelKey: "guests",
    href: eventGuestsRoute,
    icon: Users,
    match: (pathname, eventId) => pathname === eventGuestsRoute(eventId),
  },
  {
    labelKey: "billing",
    href: billingRoute,
    icon: CreditCard,
    match: (pathname, eventId) => pathname === billingRoute(eventId),
  },
  {
    labelKey: "settings",
    href: eventEditRoute,
    icon: Settings,
    match: (pathname, eventId) => pathname === eventEditRoute(eventId),
  },
];

/**
 * Sub-navigation for one selected service, shown as a SidebarMenuSub under
 * "Services" in the app sidebar, mirroring the per-event sub-navigation so a
 * service's day line, management and configuration stay one click apart.
 */
export const SERVICE_SUB_NAV_ITEMS: EventSubNavItem[] = [
  {
    labelKey: "dayLine",
    href: serviceLineRoute,
    icon: ListOrdered,
    match: (pathname, serviceId) => pathname === serviceLineRoute(serviceId),
  },
  {
    labelKey: "manage",
    href: serviceManageRoute,
    icon: ClipboardList,
    match: (pathname, serviceId) => pathname === serviceManageRoute(serviceId),
  },
  {
    labelKey: "configuration",
    href: serviceConfigurationRoute,
    icon: Settings,
    match: (pathname, serviceId) => pathname === serviceConfigurationRoute(serviceId),
  },
];

/** Extracts the event id from a pathname like `/events/{id}/...`, or null outside that shape. */
export function currentEventId(pathname: string): string | null {
  const match = pathname.match(/^\/events\/([^/]+)(?:\/|$)/);
  const id = match?.[1];
  if (!id || id === "new") return null;
  return id;
}

/** Extracts the service id from a pathname like `/services/{id}/...`, or null outside that shape. */
export function currentServiceId(pathname: string): string | null {
  const match = pathname.match(/^\/services\/([^/]+)(?:\/|$)/);
  const id = match?.[1];
  if (!id) return null;
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

export type OrganizerRole = keyof Messages["common"]["roles"];

/**
 * The `common.roles` key for a role as the backend names it: session roles carry
 * an `ORGANIZER_` prefix (`ORGANIZER_OWNER`), membership roles do not (`OWNER`).
 * Null for a role the catalog does not know, which callers show as is.
 */
export function organizerRole(role: string): OrganizerRole | null {
  const key = role.replace(/^ORGANIZER_/, "");
  return key === "OWNER" || key === "ADMIN" || key === "MEMBER" ? key : null;
}
