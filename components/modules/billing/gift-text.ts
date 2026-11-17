"use client";

import { useTranslations } from "next-intl";
import type { Gift } from "./schema";

/** What a gift gives, in the organizer's words (JIKU-315). */
export function useGiftText() {
  const t = useTranslations("billing.gifts.what");
  return (gift: Pick<Gift, "kind" | "guests" | "days" | "plan" | "months">): string => {
    switch (gift.kind) {
      case "EVENT_GUESTS":
        return t("EVENT_GUESTS", { guests: gift.guests ?? 0, days: gift.days ?? 0 });
      case "SERVICES_PLAN":
        return t("SERVICES_PLAN", { plan: gift.plan ?? "", months: gift.months ?? 0 });
      default:
        return t("ORGANIZER_PACK", { months: gift.months ?? 0 });
    }
  };
}
