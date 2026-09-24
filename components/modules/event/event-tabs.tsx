"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EVENT_TABS } from "@/components/shared/organizer-nav";

/**
 * The event workspace's tab bar. Each tab is its own URL, so a tab can be
 * shared, bookmarked and reopened; the bar only reflects the current route.
 */
export function EventTabs({ eventId }: { eventId: string }) {
  const t = useTranslations("shell.nav");
  const pathname = usePathname();
  const active = EVENT_TABS.find((tab) => tab.match(pathname, eventId)) ?? EVENT_TABS[0];

  return (
    <Tabs value={active.labelKey} className="-mx-4 overflow-x-auto px-4">
      <TabsList variant="line" aria-label={t("events")}>
        {EVENT_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger key={tab.labelKey} value={tab.labelKey} asChild>
              <Link href={tab.href(eventId)}>
                <Icon aria-hidden />
                {t(tab.labelKey)}
              </Link>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
