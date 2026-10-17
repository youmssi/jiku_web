"use client";

import { useTranslations } from "next-intl";
import { EVENT_TABS } from "@/components/shared/organizer-nav";
import { SectionNav } from "@/components/shared/section-nav";

/** The event workspace's sections; on a phone the everyday three stay in sight (JIKU-251). */
export function EventTabs({ eventId }: { eventId: string }) {
  const t = useTranslations("shell");
  return <SectionNav items={EVENT_TABS} id={eventId} label={t("nav.events")} primaryOnPhone={3} />;
}
