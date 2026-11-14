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
 * tell. Nothing shows while all is well. A team that outgrew a free plan is told
 * exactly that, with its two ways out: a team plan, or fewer people (JIKU-307).
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
  if (subscription.freePlan && subscription.peopleCovered !== null && subscription.people > subscription.peopleCovered) {
    const paused = key === "SERVICES_PAUSED";
    const outgrown = {
      plan: subscription.plan,
      people: subscription.people,
      covered: subscription.peopleCovered,
      // The deadline to choose is the end of the trial, the date the billing page shows too.
      date: day(subscription.expiresAt),
    };
    const text = paused
      ? t("outgrown.pausedDescription", outgrown)
      : subscription.expiresAt
        ? t("outgrown.description", outgrown)
        : t("outgrown.descriptionNoDate", outgrown);
    return (
      <Alert variant={paused ? "destructive" : "default"}>
        <CreditCard />
        <AlertTitle>{paused ? t("outgrown.pausedTitle") : t("outgrown.title", { plan: subscription.plan })}</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <span>{text}</span>
          {canManage ? (
            <span className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant={paused ? "default" : "outline"} className="w-fit max-md:h-11">
                <Link href={ROUTES.BILLING} className="no-underline">
                  {t("outgrown.upgrade")}
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="w-fit max-md:h-11">
                <Link href={ROUTES.SERVICES} className="no-underline">
                  {t("outgrown.shrink", { covered: subscription.peopleCovered })}
                </Link>
              </Button>
            </span>
          ) : (
            <span>{t("askManager")}</span>
          )}
        </AlertDescription>
      </Alert>
    );
  }
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
