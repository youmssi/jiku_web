import { getFormatter, getTranslations } from "next-intl/server";
import { CreditCard } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import type { BillingStatus } from "@/components/modules/billing/schema";

/**
 * The one billing matter to act on, shown across the app (JIKU-254): an
 * expiring or ended services subscription, or a team that outgrew its plan.
 * Whoever manages billing gets the way to fix it; other members learn whom to
 * tell. Nothing shows while all is well.
 */
export async function BillingAttentionBanner({
  status,
  canManage,
}: {
  status: BillingStatus;
  canManage: boolean;
}) {
  const subscription = status.subscription;
  if (status.attention === "NONE" || !subscription) return null;
  const [t, format] = await Promise.all([getTranslations("billing.attention"), getFormatter()]);
  const day = (iso: string | null) => (iso ? format.dateTime(new Date(iso), { day: "numeric", month: "long" }) : "");
  const values = { plan: subscription.plan, date: day(subscription.pausesAt ?? subscription.expiresAt) };
  const key = status.attention;
  const description =
    key === "OVER_LIMIT" && !subscription.expiresAt ? t("OVER_LIMIT.descriptionNoDate", values) : t(`${key}.description`, values);

  return (
    <Alert variant={key === "SERVICES_PAUSED" ? "destructive" : "default"}>
      <CreditCard />
      <AlertTitle>{t(`${key}.title`)}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <span>{description}</span>
        {canManage ? (
          <Button asChild size="sm" variant={key === "SERVICES_PAUSED" ? "default" : "outline"} className="w-fit max-md:h-11">
            <Link href={ROUTES.BILLING} className="no-underline">
              {t(`${key}.action`)}
            </Link>
          </Button>
        ) : (
          <span>{t("askManager")}</span>
        )}
      </AlertDescription>
    </Alert>
  );
}
