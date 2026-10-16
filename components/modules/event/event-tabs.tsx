"use client";

import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EVENT_TABS } from "@/components/shared/organizer-nav";
import { cn } from "@/lib/utils";

/** The tabs a phone shows directly; the others wait under "More" (JIKU-251). */
const PRIMARY_ON_PHONE = 3;

const LINK =
  "relative inline-flex h-11 shrink-0 items-center gap-1.5 px-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring [&_svg]:size-4";
const CURRENT = "text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-foreground";

/**
 * The event workspace's sections. Each one is its own URL, so it can be
 * shared, bookmarked and reopened; this is navigation, so it is a list of
 * links marking the current page, not an ARIA tab set. On a phone the
 * everyday sections stay in sight and the rarer ones open from "More",
 * underlined (and naming the section for screen readers) when the current
 * page is one of them; the breadcrumb names it on screen.
 */
export function EventTabs({ eventId }: { eventId: string }) {
  const t = useTranslations("shell");
  const pathname = usePathname();
  const active = EVENT_TABS.find((tab) => tab.match(pathname, eventId)) ?? EVENT_TABS[0];
  const secondary = EVENT_TABS.slice(PRIMARY_ON_PHONE);
  const activeSecondary = secondary.find((tab) => tab.labelKey === active.labelKey);

  return (
    <nav aria-label={t("nav.events")} className="-mx-4 flex items-center border-b px-4">
      <ul className="flex min-w-0 flex-1 overflow-x-auto">
        {EVENT_TABS.map((tab, index) => {
          const Icon = tab.icon;
          const current = tab.labelKey === active.labelKey;
          return (
            <li key={tab.labelKey} className={cn(index >= PRIMARY_ON_PHONE && "max-md:hidden")}>
              <Link href={tab.href(eventId)} aria-current={current ? "page" : undefined} className={cn(LINK, current && CURRENT)}>
                <Icon aria-hidden className="max-md:hidden" />
                {t(`nav.${tab.labelKey}`)}
              </Link>
            </li>
          );
        })}
      </ul>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn("relative h-11 shrink-0 gap-1 md:hidden", activeSecondary && CURRENT)}
            aria-label={activeSecondary ? `${t("sidebar.more")} · ${t(`nav.${activeSecondary.labelKey}`)}` : undefined}
          >
            {t("sidebar.more")}
            <ChevronDown aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {secondary.map((tab) => {
            const Icon = tab.icon;
            return (
              <DropdownMenuItem key={tab.labelKey} asChild>
                <Link href={tab.href(eventId)} aria-current={tab.labelKey === active.labelKey ? "page" : undefined}>
                  <Icon aria-hidden />
                  {t(`nav.${tab.labelKey}`)}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
