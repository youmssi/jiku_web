"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Link } from "@/i18n/navigation";
import { RESERVE_ROUTE, SEO_ROUTES } from "@/lib/constants";
import { formatAmount } from "@/lib/currency";
import { PRICING, quoteForGuests, FREE_TIER, CUSTOM_TIER } from "@/lib/pricing";
import type { SimulatorContent } from "./simulator-content";

const SLIDER_MAX = 2000;
const DEFAULT_GUESTS = 150;

function tierLabel(tier: string, content: SimulatorContent): string {
  if (tier === FREE_TIER) return content.result.freeLabel;
  if (tier === CUSTOM_TIER) return "CUSTOM";
  return tier;
}

/**
 * The interactive pricing playground: a guest-count input with a live quote and
 * a tier ladder, so a visitor sees exactly what their event will cost before
 * they commit. Purely client-side (lib/pricing.ts mirrors the backend defaults);
 * the authoritative price is recomputed server-side when they actually reserve.
 */
export function SimulatorCalculator({ content }: { content: SimulatorContent }) {
  const [guestCount, setGuestCount] = useState(DEFAULT_GUESTS);
  const quote = useMemo(() => quoteForGuests(guestCount), [guestCount]);
  const isFree = quote.tier === FREE_TIER;

  const reserveHref = `${RESERVE_ROUTE}?guests=${guestCount}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* Input + quote */}
      <div className="rounded-3xl border border-border/40 bg-card/50 p-8">
        <label
          htmlFor="simulator-guests"
          className="text-sm font-medium text-muted-foreground"
        >
          {content.input.label}
        </label>
        <div className="mt-4 flex items-center gap-4">
          <Slider
            value={[guestCount]}
            min={1}
            max={SLIDER_MAX}
            step={1}
            onValueChange={(value) => setGuestCount(value[0])}
            aria-label={content.input.label}
            className="flex-1"
          />
          <Input
            id="simulator-guests"
            type="number"
            min={1}
            value={guestCount}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (Number.isFinite(value) && value >= 1) {
                setGuestCount(Math.min(value, SLIDER_MAX * 2));
              }
            }}
            className="w-28 text-center"
            inputMode="numeric"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{content.input.helper}</p>

        <div className="mt-8 rounded-2xl border border-primary/15 bg-primary/5 p-6">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{content.result.tierLabel}</p>
              <p className="mt-1 text-xl font-semibold tracking-tight">
                {tierLabel(quote.tier, content)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{content.result.totalLabel}</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">
                {formatAmount(quote.totalMinor, PRICING.currency)}
              </p>
            </div>
          </div>

          {isFree ? (
            <p className="mt-4 text-sm text-muted-foreground">{content.result.freeNote}</p>
          ) : quote.isCustom ? (
            <>
              <p className="mt-4 text-sm text-muted-foreground">{content.result.customNote}</p>
              <p className="mt-2 text-xs text-muted-foreground">{content.result.perGuestNote}</p>
            </>
          ) : (
            <>
              <div className="mt-4 flex items-baseline justify-between border-t border-border/40 pt-4">
                <p className="text-sm text-muted-foreground">{content.result.depositLabel}</p>
                <p className="text-base font-semibold">
                  {formatAmount(quote.depositMinor, PRICING.currency)}
                </p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{content.result.depositNote}</p>
            </>
          )}
        </div>
      </div>

      {/* Tier ladder + CTA */}
      <div className="flex flex-col gap-6">
        <div className="rounded-3xl border border-border/40 bg-card/50 p-6">
          <p className="text-sm font-semibold">{content.ladder.heading}</p>
          <p className="mt-1 text-xs text-muted-foreground">{content.ladder.note}</p>
          <div className="mt-5 space-y-2">
            <TierRow
              name={content.result.freeLabel}
              range={`1–${PRICING.freeTierGuests}`}
              price={formatAmount(0, PRICING.currency)}
              active={quote.tier === FREE_TIER}
            />
            {PRICING.tiers.map((tier, i) => {
              const lower = i === 0 ? PRICING.freeTierGuests + 1 : PRICING.tiers[i - 1].maxGuests + 1;
              return (
                <TierRow
                  key={tier.name}
                  name={tier.name}
                  range={`${lower}–${tier.maxGuests}`}
                  price={formatAmount(tier.priceMinor, PRICING.currency)}
                  active={quote.tier === tier.name}
                />
              );
            })}
            <TierRow
              name="CUSTOM"
              range={`${PRICING.tiers[PRICING.tiers.length - 1].maxGuests + 1}+`}
              price="Sur devis"
              active={quote.isCustom}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-primary/15 bg-gradient-to-b from-primary/[0.06] to-transparent p-6">
          <p className="text-lg font-semibold">{content.cta.heading}</p>
          <p className="mt-2 text-sm text-muted-foreground">{content.cta.text}</p>
          <Button asChild size="lg" className="mt-5 w-full rounded-full">
            <Link href={reserveHref}>
              {content.cta.primary}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="mt-3 w-full rounded-full">
            <Link href={SEO_ROUTES.USE_CASES}>{content.cta.secondary}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function TierRow({
  name,
  range,
  price,
  active,
}: {
  name: string;
  range: string;
  price: string;
  active: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
        active ? "border-primary/40 bg-primary/10" : "border-border/40"
      }`}
    >
      <div className="flex items-center gap-2">
        {active ? <Sparkles className="size-3.5 text-primary" /> : null}
        <span className="font-medium">{name}</span>
      </div>
      <div className="text-right">
        <span className="block text-xs text-muted-foreground">{range}</span>
        <span className="font-semibold">{price}</span>
      </div>
    </div>
  );
}
