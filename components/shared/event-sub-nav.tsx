"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { EVENT_SUB_NAV_ITEMS } from "@/components/shared/organizer-nav";

/**
 * Horizontal sub-navigation between one event's views (Dashboard/Analytics/Guests/
 * Settings). Shown at the top of every per-event page — the desktop sidebar also
 * exposes the same items as an expand-in-place SidebarMenuSub, but this strip is
 * what gives mobile (no sidebar sub-menu under the bottom-tab-bar nav) the same
 * quick navigation between an event's pages.
 */
export function EventSubNav({ eventId }: { eventId: string }) {
  const pathname = usePathname();

  return (
    <nav className="-mx-4 mb-6 flex gap-1 overflow-x-auto border-b px-4 sm:mx-0 sm:px-0">
      {EVENT_SUB_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = item.match(pathname, eventId);
        return (
          <Link
            key={item.label}
            href={item.href(eventId)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
