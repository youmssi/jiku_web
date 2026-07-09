import { CalendarDays, LayoutDashboard, Settings } from "lucide-react";
import { ROUTES } from "@/lib/constants";

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
    label: "Settings",
    href: ROUTES.SETTINGS,
    icon: Settings,
    match: (pathname) => pathname === ROUTES.SETTINGS || pathname.startsWith(`${ROUTES.SETTINGS}/`),
  },
];

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
