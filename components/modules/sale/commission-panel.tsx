"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ActivationInstructions, type ManualPaymentInstructions } from "@/components/modules/billing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatAmount } from "@/lib/currency";
import { commissionQuoteAction, openBatchAction } from "./sale.service";
import type { BatchMode, CommissionCategory, CommissionOverview, CommissionQuote } from "./schema";

type Choice = "FREE" | "CREDIT" | "ONLINE" | "TRANSFER";

/**
 * Jikū's commission on the event's tickets sold (JIKU-178): each category sells
 * the tickets its batches cover, and pauses when they are used up — except on
 * the event's day. A batch is free the first time, may be taken on credit
 * once, and is otherwise paid online or by transfer.
 */
export function CommissionPanel({
  eventId,
  overview,
  onlinePayment,
}: {
  eventId: string;
  overview: CommissionOverview;
  onlinePayment: boolean;
}) {
  const t = useTranslations("events.commission");
  const locale = useLocale();
  const [category, setCategory] = useState<CommissionCategory | null>(null);
  const close = useCallback(() => setCategory(null), []);

  if (overview.categories.length === 0) return null;

  return (
    <section className="rounded-xl border p-4">
      <h3 className="text-sm font-semibold">{t("title", { rate: overview.ratePercent })}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{t("text", { size: overview.batchSize })}</p>

      {overview.onEventDay ? <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-200">{t("eventDay")}</p> : null}
      {overview.owedMinor > 0 ? (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          {t("owed", { amount: formatAmount(overview.owedMinor, overview.currency, locale) })}
        </p>
      ) : null}
      {overview.creditMinor > 0 ? (
        <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-900 dark:bg-green-950 dark:text-green-200">
          {t("credit", { amount: formatAmount(overview.creditMinor, overview.currency, locale) })}
        </p>
      ) : null}

      <ul className="mt-3 divide-y">
        {overview.categories.map((row) => (
          <li key={row.ticketTypeId} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="flex items-center gap-2 font-medium">
                {row.label}
                {row.covered === 0 && !overview.onEventDay ? <Badge variant="outline">{t("paused")}</Badge> : null}
                {row.pendingPayment ? <Badge variant="secondary">{t("pendingPayment")}</Badge> : null}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("row", {
                  sold: row.sold,
                  covered: row.covered,
                  commission: formatAmount(row.unitCommissionMinor, overview.currency, locale),
                })}
              </p>
            </div>
            <Button size="sm" variant={row.covered === 0 ? "default" : "outline"} disabled={row.nextBatchSize === 0} onClick={() => setCategory(row)}>
              {row.nextBatchSize === 0 ? t("allCovered") : t("openBatch", { count: row.nextBatchSize })}
            </Button>
          </li>
        ))}
      </ul>

      {category ? (
        <OpenBatchDialog
          eventId={eventId}
          category={category}
          onlinePayment={onlinePayment}
          onClose={close}
        />
      ) : null}
    </section>
  );
}

function OpenBatchDialog({
  eventId,
  category,
  onlinePayment,
  onClose,
}: {
  eventId: string;
  category: CommissionCategory;
  onlinePayment: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("events.commission");
  const locale = useLocale();
  const [quote, setQuote] = useState<CommissionQuote | null>(null);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [instructions, setInstructions] = useState<ManualPaymentInstructions | null>(null);
  const [loading, startLoading] = useTransition();
  const [submitting, startSubmitting] = useTransition();

  useEffect(() => {
    startLoading(async () => {
      const result = await commissionQuoteAction(eventId, category.ticketTypeId);
      if (!result.ok) {
        toast.error(result.error);
        onClose();
        return;
      }
      setQuote(result.data);
      setChoice(result.data.freeBatchAvailable ? "FREE" : result.data.totalMinor === 0 || onlinePayment ? "ONLINE" : "TRANSFER");
    });
  }, [eventId, category.ticketTypeId, onlinePayment, onClose]);

  function submit() {
    if (!quote || !choice) return;
    const mode: BatchMode = choice === "FREE" ? "FREE" : choice === "CREDIT" ? "CREDIT" : "PAY";
    startSubmitting(async () => {
      const result = await openBatchAction(eventId, category.ticketTypeId, mode, choice === "TRANSFER");
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const redirect = result.data.payment?.instruction.type === "REDIRECT" ? safeUrl(result.data.payment.instruction.value) : null;
      if (redirect) {
        window.location.assign(redirect);
        return;
      }
      if (result.data.instructions) {
        setInstructions(result.data.instructions);
        return;
      }
      toast.success(t("opened", { count: result.data.size }));
      onClose();
    });
  }

  const money = (minor: number) => formatAmount(minor, quote?.currency ?? "", locale);

  return (
    <Dialog open onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialogTitle", { label: category.label })}</DialogTitle>
          <DialogDescription>{t("dialogText")}</DialogDescription>
        </DialogHeader>

        {instructions ? (
          <ActivationInstructions instructions={{ ...instructions, tier: t("batchLabel", { count: quote?.size ?? 0, label: category.label }) }} />
        ) : !quote || loading ? (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        ) : (
          <div className="flex flex-col gap-4">
            <dl className="space-y-1 text-sm">
              <Line label={t("batch", { count: quote.size, commission: money(quote.unitCommissionMinor) })} value={money(quote.amountMinor)} />
              {quote.owedMinor > 0 ? <Line label={t("owedLine")} value={money(quote.owedMinor)} /> : null}
              {quote.creditAppliedMinor > 0 ? <Line label={t("creditLine")} value={`− ${money(quote.creditAppliedMinor)}`} /> : null}
              <Line label={t("total")} value={money(quote.totalMinor)} strong />
            </dl>

            <RadioGroup value={choice ?? undefined} onValueChange={(value) => setChoice(value as Choice)}>
              {quote.freeBatchAvailable ? <Option value="FREE" label={t("choices.FREE")} /> : null}
              {quote.creditBatchAvailable ? <Option value="CREDIT" label={t("choices.CREDIT")} /> : null}
              {onlinePayment || quote.totalMinor === 0 ? (
                <Option value="ONLINE" label={quote.totalMinor === 0 ? t("choices.COVERED") : t("choices.ONLINE", { amount: money(quote.totalMinor) })} />
              ) : null}
              {quote.totalMinor > 0 ? <Option value="TRANSFER" label={t("choices.TRANSFER", { amount: money(quote.totalMinor) })} /> : null}
            </RadioGroup>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            {instructions ? t("close") : t("cancel")}
          </Button>
          {instructions ? null : (
            <Button type="button" onClick={submit} disabled={!quote || !choice || submitting}>
              {submitting ? t("working") : t("confirm")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Option({ value, label }: { value: Choice; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <RadioGroupItem value={value} id={`batch-${value}`} />
      <Label htmlFor={`batch-${value}`} className="font-normal">
        {label}
      </Label>
    </div>
  );
}

function Line({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? "flex justify-between border-t pt-2 font-semibold" : "flex justify-between"}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

/** Only a web page is ever handed to the browser as a redirect. */
function safeUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}
