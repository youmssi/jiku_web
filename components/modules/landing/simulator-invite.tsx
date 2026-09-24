"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { CUSTOM_TIER, FREE_TIER, PRICING, quoteForGuests } from "@/lib/pricing";
import { salesMailto } from "@/lib/support";
import { cn } from "@/lib/utils";
import type { LandingLocale } from "./content";
import type { SimulatorContent } from "./simulator-content";
import type { PriceFormat } from "./simulator-format";
import { NumberField } from "./simulator-number-field";

const SLIDER_MAX = 2_000;

/** "J'invite des personnes": guest count to tier and price, paid once, at the action. */
export function InvitePanel({
  content,
  locale,
  format,
  guests,
  onGuestsChange,
}: {
  content: SimulatorContent;
  locale: LandingLocale;
  format: PriceFormat;
  guests: number;
  onGuestsChange: (guests: number) => void;
}) {
  const { invite } = content;
  const quote = quoteForGuests(guests);
  const isFree = quote.tier === FREE_TIER;
  const tierName = isFree ? invite.result.freeLabel : quote.tier === CUSTOM_TIER ? "CUSTOM" : quote.tier;
  const guestsWord = locale === "fr" ? "invités" : "guests";
  const lastTier = PRICING.tiers[PRICING.tiers.length - 1];

  return (
    <div className="flex flex-col gap-8">
      <p className="mx-auto max-w-2xl text-center text-base leading-relaxed text-muted-foreground">{invite.intro}</p>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-border/50 bg-card/60 p-6 sm:p-8">
          <NumberField
            id="simulator-guests"
            label={invite.input.label}
            helper={invite.input.helper}
            value={guests}
            min={1}
            max={SLIDER_MAX}
            inputMax={SLIDER_MAX * 5}
            onChange={onGuestsChange}
          />

          <div className="mt-8 rounded-2xl border border-primary/15 bg-primary/5 p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{invite.result.tierLabel}</p>
                <p className="mt-1 text-xl font-semibold tracking-tight">{tierName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{invite.result.totalLabel}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight">{format.gnf(quote.totalMinor)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{format.usd(quote.totalMinor)}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t border-border/40 pt-4 text-sm text-muted-foreground">
              {isFree ? (
                <p>{invite.result.freeNote}</p>
              ) : quote.isCustom ? (
                <>
                  <p>{invite.result.customNote}</p>
                  <p className="text-xs">{invite.result.perGuestNote}</p>
                </>
              ) : (
                <>
                  <p>{invite.result.paymentNote}</p>
                  <p>{invite.result.upgradeNote}</p>
                </>
              )}
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-3xl border border-border/50 bg-card/60 p-6">
            <p className="text-sm font-semibold">{invite.ladder.heading}</p>
            <p className="mt-1 text-xs text-muted-foreground">{invite.ladder.note}</p>
            <div className="mt-5 flex flex-col gap-2">
              <TierRow
                name={invite.result.freeLabel}
                range={`1 – ${format.number(PRICING.freeTierGuests)}`}
                price={format.gnf(0)}
                active={isFree}
              />
              {PRICING.tiers.map((tier, index) => {
                const lower = index === 0 ? PRICING.freeTierGuests + 1 : PRICING.tiers[index - 1].maxGuests + 1;
                return (
                  <TierRow
                    key={tier.name}
                    name={tier.name}
                    range={`${format.number(lower)} – ${format.number(tier.maxGuests)}`}
                    price={format.gnf(tier.priceMinor)}
                    active={quote.tier === tier.name}
                  />
                );
              })}
              <TierRow
                name="CUSTOM"
                range={`${format.number(lastTier.maxGuests + 1)}+`}
                price={content.onQuote}
                active={quote.isCustom}
              />
            </div>
          </div>
          <Button asChild size="lg" className="w-full rounded-full">
            {quote.isCustom ? (
              <a href={salesMailto(`${invite.quoteSubjectPrefix} ${guests} ${guestsWord}`)}>
                {invite.quoteCta}
                <ArrowRight data-icon="inline-end" />
              </a>
            ) : (
              <Link href={ROUTES.REGISTER}>
                {content.cta.primary}
                <ArrowRight data-icon="inline-end" />
              </Link>
            )}
          </Button>
        </aside>
      </div>
    </div>
  );
}

function TierRow({ name, range, price, active }: { name: string; range: string; price: string; active: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors",
        active ? "border-primary/40 bg-primary/10" : "border-border/40",
      )}
    >
      <span className="flex items-center gap-2 font-medium">
        {active ? <Sparkles className="size-3.5 text-primary" /> : null}
        {name}
      </span>
      <span className="text-right">
        <span className="block text-xs text-muted-foreground">{range}</span>
        <span className="font-semibold">{price}</span>
      </span>
    </div>
  );
}
