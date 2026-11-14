import { useTranslations } from "next-intl";

/** The fields of a payment or a request that say what it buys (JIKU-307). */
export interface Purchase {
  kind: string;
  tier: string;
  guests: number | null;
  months?: number | null;
  subscriptionMonths?: number | null;
  eventName?: string | null;
  eventTitle?: string | null;
}

const KINDS = ["GUESTS", "SUBSCRIPTION", "PACK", "PACK_EXTRA", "COMMISSION"] as const;
type Kind = (typeof KINDS)[number];

/**
 * What a payment bought, in the reader's language (JIKU-307): the API's own
 * label is English, so it is rebuilt here from the kind, the plan, the months,
 * the guests and the event's name.
 */
export function usePurchaseLabel(): (purchase: Purchase) => string {
  const t = useTranslations("billing.purchase");
  return (purchase) => {
    const kind = KINDS.includes(purchase.kind as Kind) ? (purchase.kind as Kind) : "GUESTS";
    const months = purchase.months ?? purchase.subscriptionMonths ?? 1;
    const event = purchase.eventTitle ?? t("event");
    switch (kind) {
      case "SUBSCRIPTION":
        return t("SUBSCRIPTION", { plan: purchase.tier, months });
      case "PACK":
        return t("PACK", { months });
      case "PACK_EXTRA":
        return t("PACK_EXTRA", { count: purchase.guests ?? 0 });
      case "COMMISSION":
        return t("COMMISSION", { event });
      default:
        return t("GUESTS", { event, count: purchase.guests ?? 0 });
    }
  };
}
