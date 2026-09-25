"use client";

import { useState, useTransition } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatAmount } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { requestSubscriptionAction } from "@/components/modules/billing/billing.service";
import { ActivationInstructions } from "@/components/modules/billing/activation-instructions";
import type {
  ManualPaymentInstructions,
  SubscriptionPlanOption,
  SubscriptionStatus,
  SubscriptionView,
} from "@/components/modules/billing/schema";

const DAY_MS = 86_400_000;
const NOTICE_DAYS = 7;
const REMINDERS_LOW_SHARE = 0.8;

/**
 * The organizer's services subscription (JIKU-90, priced per team since ADR 105):
 * the plan and what it costs for this team, a banner when a paid period ends
 * soon, is in grace, or when the team outgrew a free plan, and a request for a
 * prepayment of one month or a year (two months free) that follows the manual
 * Mobile Money flow.
 */
export function SubscriptionSection({ initial, nowIso }: { initial: SubscriptionView; nowIso: string }) {
  const t = useTranslations("billing.subscription");
  const locale = useLocale();
  const format = useFormatter();
  const subscription = initial;
  const money = (amount: number) => formatAmount(amount, subscription.currency, locale);
  const day = (iso: string | null) => (iso ? format.dateTime(new Date(iso), { dateStyle: "long" }) : "");

  const current = subscription.plans.find((option) => option.name === subscription.plan);
  const isFree = current?.monthlyMinor === 0;
  const paidOptions = subscription.plans.filter((option) => option.monthlyMinor > 0);
  const [open, setOpen] = useState(subscription.overLimit);
  const [plan, setPlan] = useState(
    (current && !isFree ? current : paidOptions.find((option) => option.teamMonthlyMinor !== null))?.name ?? "",
  );
  const [months, setMonths] = useState(subscription.months[0]?.months ?? 1);
  const [instructions, setInstructions] = useState<ManualPaymentInstructions | null>(null);
  const [isSaving, startSave] = useTransition();

  const daysLeft = subscription.expiresAt
    ? Math.ceil((Date.parse(subscription.expiresAt) - Date.parse(nowIso)) / DAY_MS)
    : null;
  const status = subscription.status as SubscriptionStatus;
  const inGrace = status === "GRACE";
  const outgrown = subscription.overLimit && isFree;
  const nearExpiry = !inGrace && !isFree && daysLeft !== null && daysLeft <= NOTICE_DAYS;
  const reminders = subscription.whatsAppReminders;
  const remindersLeft = reminders ? Math.max(reminders.limit - reminders.sent, 0) : null;
  const remindersOut = remindersLeft === 0;
  const remindersLow =
    reminders !== null && !remindersOut && reminders.sent >= reminders.limit * REMINDERS_LOW_SHARE;

  const selected = subscription.plans.find((option) => option.name === plan);
  const period = subscription.months.find((option) => option.months === months);
  const total =
    selected?.teamMonthlyMinor != null && period ? selected.teamMonthlyMinor * period.chargedMonths : null;

  function submitRequest() {
    startSave(async () => {
      const result = await requestSubscriptionAction({ plan, months });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setInstructions(result.instructions);
      setOpen(false);
      toast.success(t("ready"));
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {outgrown ? (
        <Banner>{t("outgrown", { plan: subscription.plan, date: day(subscription.expiresAt) })}</Banner>
      ) : null}
      {inGrace ? <Banner>{t("grace", { date: day(subscription.suspensionAt) })}</Banner> : null}
      {nearExpiry ? <Banner>{t("expiring", { days: Math.max(daysLeft ?? 0, 0) })}</Banner> : null}
      {reminders && remindersOut ? <Banner>{t("remindersOut", { limit: reminders.limit })}</Banner> : null}
      {remindersLow ? <Banner>{t("remindersLow", { left: remindersLeft ?? 0 })}</Banner> : null}

      <div className="rounded-xl border p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-base font-semibold">
              {t("title", { plan: subscription.plan })}
              <Badge variant={status === "ACTIVE" ? "secondary" : "destructive"}>{t(`status.${status}`)}</Badge>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isFree ? t("free") : t("renews", { date: day(subscription.expiresAt) })}
            </p>
          </div>
          <Button
            variant={outgrown || remindersOut ? "default" : "outline"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? t("cancel") : outgrown || remindersOut ? t("choose") : t("change")}
          </Button>
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">
              {t("people", { active: subscription.resourcesActive })}
            </dt>
            <dd className="font-medium">{t("included", { count: subscription.resourcesIncluded })}</dd>
          </div>
          {!isFree ? (
            <div>
              <dt className="text-muted-foreground">{t("teamPrice")}</dt>
              <dd className="font-medium">{t("monthly", { amount: money(subscription.monthlyMinor) })}</dd>
            </div>
          ) : null}
          {reminders ? (
            <div className="sm:col-span-2">
              <dt className="flex items-center justify-between text-muted-foreground">
                {t("reminders")}
                <span className="font-medium text-foreground">
                  {t("remindersUsed", { sent: reminders.sent, limit: reminders.limit })}
                </span>
              </dt>
              <dd className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all", remindersOut ? "bg-destructive" : "bg-primary")}
                  style={{
                    width: `${Math.min(100, reminders.limit > 0 ? (reminders.sent / reminders.limit) * 100 : 100)}%`,
                  }}
                />
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      {instructions ? <ActivationInstructions instructions={instructions} /> : null}

      {open ? (
        <div className="flex flex-col gap-5 rounded-xl border p-5">
          <RadioGroup value={plan} onValueChange={setPlan} className="grid gap-3 sm:grid-cols-2">
            {paidOptions.map((option) => (
              <PlanCard key={option.name} option={option} current={option.name === subscription.plan} money={money} />
            ))}
          </RadioGroup>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">{t("period.label")}</span>
            <ToggleGroup
              type="single"
              variant="outline"
              value={String(months)}
              onValueChange={(value) => value && setMonths(Number.parseInt(value, 10))}
            >
              {subscription.months.map((option) => (
                <ToggleGroupItem key={option.months} value={String(option.months)} className="px-3">
                  {option.months === 12 ? t("period.yearly") : t("period.monthly")}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-lg font-semibold">{total !== null ? t("total", { amount: money(total) }) : null}</p>
            <Button onClick={submitRequest} disabled={isSaving || total === null}>
              {isSaving ? t("requesting") : t("request")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PlanCard({
  option,
  current,
  money,
}: {
  option: SubscriptionPlanOption;
  current: boolean;
  money: (amount: number) => string;
}) {
  const t = useTranslations("billing.subscription.plan");
  const holdsTeam = option.teamMonthlyMinor !== null;
  return (
    <RadioGroupPrimitive.Item
      value={option.name}
      disabled={!holdsTeam}
      className="group flex flex-col rounded-xl border p-4 text-left transition-colors outline-none hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary/[0.06]"
    >
      <span className="flex items-center justify-between gap-2 font-semibold">
        <span className="flex items-center gap-2">
          {option.name}
          {current ? <Badge variant="outline">{t("current")}</Badge> : null}
        </span>
        <Check className="size-4 text-primary opacity-0 group-data-[state=checked]:opacity-100" />
      </span>
      <span className="mt-2 text-sm">{t("base", { amount: money(option.monthlyMinor) })}</span>
      <span className="text-xs text-muted-foreground">{t("includes", { count: option.includedPeople })}</span>
      {option.extraPersonMinor !== null ? (
        <span className="text-xs text-muted-foreground">{t("extra", { amount: money(option.extraPersonMinor) })}</span>
      ) : null}
      <span className={cn("mt-3 text-sm font-medium", holdsTeam ? "text-primary" : "text-muted-foreground")}>
        {holdsTeam ? t("team", { amount: money(option.teamMonthlyMinor ?? 0) }) : t("tooSmall")}
      </span>
    </RadioGroupPrimitive.Item>
  );
}

function Banner({ children }: { children: React.ReactNode }) {
  return (
    <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
      <AlertDescription className="text-inherit">{children}</AlertDescription>
    </Alert>
  );
}
