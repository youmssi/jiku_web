"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toMajorUnits, toMinorUnits } from "@/lib/currency";
import { updateDurationAction, updateServicePriceAction } from "./services.service";
import { DURATION_CHOICES, SERVICE_PAYMENT_RULES, type ServicePaymentRule, type ServiceSummary } from "./schema";

/**
 * What every service is about (JIKU-252): how long an appointment lasts, saved
 * on each tap, and what the client pays and when. The price is stated in the
 * organization's currency.
 */
export function ServiceBasics({
  service,
  durationMinutes,
  currency,
}: {
  service: ServiceSummary;
  durationMinutes: number;
  currency: string | null;
}) {
  const t = useTranslations("services.basics");
  const [duration, setDuration] = useState(durationMinutes);
  const [rule, setRule] = useState<ServicePaymentRule>(service.paymentRule);
  const priceCurrency = service.currency ?? currency;
  const initialAmount =
    service.priceMinor != null && priceCurrency ? String(toMajorUnits(service.priceMinor, priceCurrency)) : "";
  const [amount, setAmount] = useState(initialAmount);
  const [savedPrice, setSavedPrice] = useState({ rule: service.paymentRule, amount: initialAmount });
  const [savingDuration, startDuration] = useTransition();
  const [savingPrice, startPrice] = useTransition();
  const choices = DURATION_CHOICES.includes(duration as (typeof DURATION_CHOICES)[number])
    ? [...DURATION_CHOICES]
    : [...DURATION_CHOICES, duration].sort((a, b) => a - b);

  function changeDuration(next: number) {
    const previous = duration;
    setDuration(next);
    startDuration(async () => {
      const result = await updateDurationAction(service.id, next);
      if (!result.ok) {
        setDuration(previous);
        toast.error(result.error);
        return;
      }
      toast.success(t("durationSaved"));
    });
  }

  function savePrice() {
    const major = Number(amount.replace(",", "."));
    startPrice(async () => {
      const priceMinor = rule === "FREE" || !priceCurrency ? null : toMinorUnits(major, priceCurrency);
      const result = await updateServicePriceAction(service.id, rule, priceMinor);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setSavedPrice({ rule, amount });
      toast.success(t("saved"));
    });
  }

  const priceChanged = rule !== savedPrice.rule || (rule !== "FREE" && amount !== savedPrice.amount);
  const priceInvalid = rule !== "FREE" && !(Number(amount.replace(",", ".")) > 0);

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold">{t("title")}</h2>
      <FieldSet>
        <FieldLegend variant="label">{t("duration")}</FieldLegend>
        <ToggleGroup
          type="single"
          variant="outline"
          value={String(duration)}
          onValueChange={(value) => value && changeDuration(Number(value))}
          disabled={savingDuration}
          className="flex-wrap"
        >
          {choices.map((minutes) => (
            <ToggleGroupItem key={minutes} value={String(minutes)} className="gap-1.5 max-md:h-11">
              {minutes === duration ? <Check aria-hidden /> : null}
              {t("minutes", { count: minutes })}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </FieldSet>
      <div className="flex flex-col gap-4">
        <Field className="max-w-xs">
          <FieldLabel htmlFor="service-payment-rule">{t("rule")}</FieldLabel>
          <Select value={rule} onValueChange={(value) => setRule(value as ServicePaymentRule)}>
            <SelectTrigger id="service-payment-rule">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_PAYMENT_RULES.map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`rules.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {rule !== "FREE" && priceCurrency ? (
          <Field className="max-w-xs">
            <FieldLabel htmlFor="service-price">{t("amount", { currency: priceCurrency })}</FieldLabel>
            <Input
              id="service-price"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              aria-invalid={priceInvalid && amount !== ""}
            />
          </Field>
        ) : null}
        {priceChanged ? (
          <Button className="w-fit" onClick={savePrice} disabled={savingPrice || priceInvalid}>
            {savingPrice ? t("saving") : t("save")}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
