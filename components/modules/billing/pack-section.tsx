"use client";

import { useState, useTransition } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatAmount } from "@/lib/currency";
import { requestPackAction } from "@/components/modules/billing/billing.service";
import { ActivationInstructions } from "@/components/modules/billing/activation-instructions";
import { PayOnlineButton } from "@/components/modules/billing/pay-online-button";
import type { ManualPaymentInstructions, PackView } from "@/components/modules/billing/schema";

const MAX_BLOCKS = 50;

/**
 * The Organizer Pack (ADR 105): the month's guests shared by every event, a
 * request for one month or a year (two months free) with any guests still
 * owed from an event day, and extra guests for the month in blocks. Paid
 * online when offered, or through the manual Mobile Money flow.
 */
export function PackSection({
  initial,
  canManage,
  online,
}: {
  initial: PackView;
  canManage: boolean;
  /** Online payment is offered next to the manual transfer (JIKU-165). */
  online: boolean;
}) {
  const t = useTranslations("billing.pack");
  const locale = useLocale();
  const format = useFormatter();
  const pack = initial;
  const money = (amount: number) => formatAmount(amount, pack.currency, locale);
  const day = (iso: string | null | undefined) => (iso ? format.dateTime(new Date(iso), { dateStyle: "long" }) : "");

  const allowance = pack.includedGuests + pack.extraGuests;
  const [open, setOpen] = useState(false);
  const [months, setMonths] = useState(pack.months[0]?.months ?? 1);
  const [blocks, setBlocks] = useState(1);
  const [instructions, setInstructions] = useState<ManualPaymentInstructions | null>(null);
  const [isSaving, startSave] = useTransition();

  const period = pack.months.find((option) => option.months === months);
  const total = period ? pack.monthlyMinor * period.chargedMonths + pack.owedMinor : null;
  const extraGuests = blocks * pack.extraBlockGuests;

  function submit(input: { months: number } | { blocks: number }) {
    startSave(async () => {
      const result = await requestPackAction(input);
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
            <p className="flex items-center gap-2 text-base font-semibold">
              {t("title")}
              <Badge variant={pack.active ? "secondary" : "outline"}>
                {pack.active ? t("activeUntil", { date: day(pack.expiresAt) }) : t("inactive")}
              </Badge>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("pitch", { guests: pack.includedGuests })} {t("price", { amount: money(pack.monthlyMinor) })}
            </p>
          </div>
          {canManage ? (
            <Button variant={pack.active ? "outline" : "default"} onClick={() => setOpen((value) => !value)}>
              {open ? t("cancel") : pack.active ? t("renew") : t("subscribe")}
            </Button>
          ) : null}
        </div>

        {pack.active ? (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              {t("month", { start: day(pack.monthStart), end: day(pack.monthEnd) })}
            </p>
            <p className="mt-2 text-sm">{t("used", { used: pack.usedGuests, allowance })}</p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(100, allowance > 0 ? (pack.usedGuests / allowance) * 100 : 0)}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t("remaining", { count: pack.remainingGuests })}</p>
          </div>
        ) : null}
      </div>

      {pack.owedGuests > 0 ? (
        <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertDescription className="text-inherit">
            {t("owed", { count: pack.owedGuests, amount: money(pack.owedMinor) })}
          </AlertDescription>
        </Alert>
      ) : null}

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
              {pack.months.map((option) => (
                <ToggleGroupItem key={option.months} value={String(option.months)} className="px-3">
                  {option.months === 12 ? t("period.yearly") : t("period.monthly")}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <div>
              <p className="text-lg font-semibold">{total !== null ? t("total", { amount: money(total) }) : null}</p>
              {pack.owedMinor > 0 ? (
                <p className="text-xs text-muted-foreground">{t("includesOwed", { amount: money(pack.owedMinor) })}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={online ? "outline" : "default"}
                onClick={() => submit({ months })}
                disabled={isSaving || total === null}
              >
                {isSaving ? t("requesting") : t("request")}
              </Button>
              {online ? <PayOnlineButton target={{ kind: "pack", months }} disabled={total === null} /> : null}
            </div>
          </div>
        </div>
      ) : null}

      {pack.active && canManage ? (
        <div className="flex flex-col gap-3 rounded-xl border p-5">
          <div>
            <p className="font-medium">{t("extraTitle")}</p>
            <p className="text-sm text-muted-foreground">
              {t("extraText", { block: pack.extraBlockGuests, amount: money(pack.extraPerGuestMinor) })}
            </p>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pack-blocks">{t("blocks")}</Label>
                <Input
                  id="pack-blocks"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={MAX_BLOCKS}
                  value={blocks}
                  onChange={(event) =>
                    setBlocks(Math.min(MAX_BLOCKS, Math.max(1, Number.parseInt(event.target.value, 10) || 1)))
                  }
                  className="w-24"
                />
              </div>
              <p className="pb-2 text-sm font-medium">
                {t("extraTotal", { guests: extraGuests, amount: money(extraGuests * pack.extraPerGuestMinor) })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => submit({ blocks })} disabled={isSaving}>
                {isSaving ? t("requesting") : t("request")}
              </Button>
              {online ? <PayOnlineButton target={{ kind: "packExtra", blocks }} /> : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
