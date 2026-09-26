"use client";

import { useState, useTransition } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Link } from "@/i18n/navigation";
import { formatAmount } from "@/lib/currency";
import { ROUTES } from "@/lib/constants";
import { requestOwnNumberAction } from "@/components/modules/billing/billing.service";
import { ActivationInstructions } from "@/components/modules/billing/activation-instructions";
import { PayOnlineButton } from "@/components/modules/billing/pay-online-button";
import type { ManualPaymentInstructions, OwnWhatsAppNumberView } from "@/components/modules/billing/schema";

/**
 * Sending from the organization's own WhatsApp number (ADR 105): included in
 * the Organisation plan and the Organizer Pack, a monthly add-on otherwise,
 * paid online when offered or through the manual Mobile Money flow. Once it is allowed, the
 * number is connected from the messaging settings.
 */
export function OwnNumberSection({
  initial,
  canManage,
  online,
}: {
  initial: OwnWhatsAppNumberView;
  canManage: boolean;
  /** Online payment is offered next to the manual transfer (JIKU-165). */
  online: boolean;
}) {
  const t = useTranslations("billing.ownNumber");
  const locale = useLocale();
  const format = useFormatter();
  const view = initial;
  const money = (amount: number) => formatAmount(amount, view.currency, locale);
  const buysAddon = view.source === "NONE" || view.source === "ADDON";

  const [open, setOpen] = useState(false);
  const [months, setMonths] = useState(view.months[0]?.months ?? 1);
  const [instructions, setInstructions] = useState<ManualPaymentInstructions | null>(null);
  const [isSaving, startSave] = useTransition();

  const period = view.months.find((option) => option.months === months);
  const total = period ? view.monthlyMinor * period.chargedMonths : null;

  function submit() {
    startSave(async () => {
      const result = await requestOwnNumberAction(months);
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
      <div className="rounded-xl border p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-md">
            <p className="flex flex-wrap items-center gap-2 text-base font-semibold">
              {t("title")}
              <Badge variant={view.allowed ? "secondary" : "outline"}>
                {view.source === "ADDON" && view.addonExpiresAt
                  ? t("source.ADDON", { date: format.dateTime(new Date(view.addonExpiresAt), { dateStyle: "long" }) })
                  : t(`source.${view.source}`)}
              </Badge>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{t("pitch")}</p>
            {buysAddon ? (
              <p className="mt-2 text-sm">
                {t("price", { amount: money(view.monthlyMinor) })}
                <span className="text-muted-foreground"> · {t("included", { plans: view.includedPlans.join(", ") })}</span>
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {view.allowed ? (
              <Button asChild variant={buysAddon ? "outline" : "default"}>
                <Link href={`${ROUTES.SETTINGS}?tab=messaging`}>{t("connect")}</Link>
              </Button>
            ) : null}
            {canManage && buysAddon ? (
              <Button variant={view.allowed ? "outline" : "default"} onClick={() => setOpen((value) => !value)}>
                {open ? t("cancel") : view.allowed ? t("renew") : t("subscribe")}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {instructions ? <ActivationInstructions instructions={instructions} /> : null}

      {open ? (
        <div className="flex flex-col gap-4 rounded-xl border p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">{t("period.label")}</span>
            <ToggleGroup
              type="single"
              variant="outline"
              value={String(months)}
              onValueChange={(value) => value && setMonths(Number.parseInt(value, 10))}
            >
              {view.months.map((option) => (
                <ToggleGroupItem key={option.months} value={String(option.months)} className="px-3">
                  {option.months === 12 ? t("period.yearly") : t("period.monthly")}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-lg font-semibold">{total !== null ? t("total", { amount: money(total) }) : null}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant={online ? "outline" : "default"} onClick={submit} disabled={isSaving || total === null}>
                {isSaving ? t("requesting") : t("request")}
              </Button>
              {online ? <PayOnlineButton target={{ kind: "ownNumber", months }} disabled={total === null} /> : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
