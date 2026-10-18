"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { SpotlightCard } from "@/components/effects";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  PRICING_CURRENCIES,
  organizerPackBreakEven,
  organizerPackCost,
  perEventCost,
  type PricingCurrency,
} from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { LandingLocale } from "./content";
import { NumberField } from "./number-field";
import { defaultCurrency, fill, priceFormat } from "./price-format";
import type { PricingContent } from "./pricing-content";

/**
 * One question — guests a month across every event — and the two monthly
 * costs side by side, the cheaper one marked. Estimates only; the backend
 * prices every payment.
 */
export function PricingCalculator({ content, locale }: { content: PricingContent["calculator"]; locale: LandingLocale }) {
  const [guests, setGuests] = useState(600);
  const [currency, setCurrency] = useState<PricingCurrency>(defaultCurrency(locale));
  const format = priceFormat(locale, currency);
  const perEvent = perEventCost(guests, currency);
  const pack = organizerPackCost(guests, currency);
  const packWins = pack < perEvent;
  const options = [
    { label: content.perEvent, amount: perEvent, cheaper: !packWins },
    { label: content.pack, amount: pack, cheaper: packWins },
  ];

  return (
    <SpotlightCard className="rounded-3xl bg-card/60">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="pricing-calculator" className="text-xl font-bold tracking-tight">
            {content.heading}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{content.text}</p>
        </div>
        <ToggleGroup
          type="single"
          variant="outline"
          aria-label={content.currencyLabel}
          value={currency}
          onValueChange={(value) => value && setCurrency(value as PricingCurrency)}
        >
          {PRICING_CURRENCIES.map((code) => (
            <ToggleGroupItem key={code} value={code} className="h-11 px-4 text-sm">
              {content.currencyNames[code]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="mt-8">
        <NumberField
          id="pricing-guests"
          label={content.question}
          helper={content.helper}
          value={guests}
          min={0}
          max={3_000}
          step={50}
          inputMax={100_000}
          onChange={setGuests}
        />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2" aria-live="polite">
        {options.map((option) => (
          <div
            key={option.label}
            className={cn(
              "rounded-2xl border p-5",
              option.cheaper ? "border-primary bg-primary/5" : "border-border bg-background/60",
            )}
          >
            <p className="flex items-center justify-between gap-2 text-sm font-semibold">
              {option.label}
              {option.cheaper ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                  <Check className="size-3" aria-hidden />
                  {content.cheaper}
                </span>
              ) : null}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">{format.money(option.amount)}</p>
            <p className="text-sm text-muted-foreground">{content.perMonth}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm font-medium">
        {fill(packWins ? content.packWins : content.eventWins, { amount: format.money(Math.abs(perEvent - pack)) })}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {fill(content.breakEven, { count: format.number(organizerPackBreakEven(currency)) })} {content.freeNote}
      </p>
    </SpotlightCard>
  );
}
