"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ORGANIZER_NAV_ITEMS } from "@/components/shared/organizer-nav";

/**
 * Native-app-style tab bar for phone-sized screens (< md). Desktop and tablet
 * keep the persistent AppSidebar instead; both read from ORGANIZER_NAV_ITEMS
 * so their active-route logic can never diverge.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
    >
      {ORGANIZER_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className={cn("size-5", active && "fill-primary/15")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
