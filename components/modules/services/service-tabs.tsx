"use client";

import { useTranslations } from "next-intl";
import { SERVICE_SUB_NAV_ITEMS } from "@/components/shared/organizer-nav";
import { SectionNav } from "@/components/shared/section-nav";

/** A service's sections (JIKU-252): link and hours, day line, settings. */
export function ServiceTabs({ serviceId }: { serviceId: string }) {
  const t = useTranslations("shell");
  return <SectionNav items={SERVICE_SUB_NAV_ITEMS} id={serviceId} label={t("nav.services")} />;
}
