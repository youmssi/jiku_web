"use client";

import { ArrowRight, Check, Sparkles } from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import {
  EVENT_PRICING,
  FREE_TIER,
  INTERACTIVE_SURCHARGE,
  ORGANIZER_PACK,
  priceIn,
  quoteForGuests,
  type DeliveryMode,
} from "@/lib/pricing";
import { salesMailto } from "@/lib/support";
import { cn } from "@/lib/utils";
import type { SimulatorContent } from "./simulator-content";
import { fill, type PriceFormat } from "./simulator-format";
import { NumberField } from "./simulator-number-field";

const SLIDER_MAX = 2_000;

/** "J'invite des personnes": guest count and delivery mode to tier and price, paid once, at the action. */
export function InvitePanel({
  content,
  format,
  guests,
  onGuestsChange,
  mode,
  onModeChange,
}: {
  content: SimulatorContent;
  format: PriceFormat;
  guests: number;
  onGuestsChange: (guests: number) => void;
  mode: DeliveryMode;
  onModeChange: (mode: DeliveryMode) => void;
}) {
  const { invite } = content;
  const quote = quoteForGuests(guests, format.currency, mode);
  const isFree = quote.tier === FREE_TIER;
  const tierName = isFree ? invite.result.freeLabel : quote.tier;
  const lastTier = EVENT_PRICING.tiers[EVENT_PRICING.tiers.length - 1];
  const beyond = format.money(priceIn(EVENT_PRICING.beyondPerGuest, format.currency));

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

          <fieldset className="mt-8">
            <legend className="text-sm font-medium">{invite.modes.heading}</legend>
            <RadioGroup
              value={mode}
              onValueChange={(value) => onModeChange(value as DeliveryMode)}
              className="mt-3 grid gap-3 sm:grid-cols-3"
            >
              {invite.modes.options.map((option) => (
                <RadioGroupPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className="group flex flex-col rounded-2xl border border-border/50 p-4 text-left transition-colors outline-none hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring data-[state=checked]:border-primary data-[state=checked]:bg-primary/[0.06]"
                >
                  <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                    {option.title}
                    <Check className="size-4 text-primary opacity-0 group-data-[state=checked]:opacity-100" />
                  </span>
                  <span className="mt-1 text-xs leading-relaxed text-muted-foreground">{option.description}</span>
                  <span className="mt-3 text-xs font-semibold text-primary">
                    {option.value === "interactive"
                      ? fill(invite.modes.perGuest, { amount: format.money(priceIn(INTERACTIVE_SURCHARGE, format.currency)) })
                      : invite.modes.included}
                  </span>
                </RadioGroupPrimitive.Item>
              ))}
            </RadioGroup>
          </fieldset>

          <div className="mt-8 rounded-2xl border border-primary/15 bg-primary/5 p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{invite.result.tierLabel}</p>
                <p className="mt-1 text-xl font-semibold tracking-tight">{tierName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{invite.result.totalLabel}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight">{format.money(quote.totalMinor)}</p>
                {quote.surchargeMinor > 0 ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {fill(invite.result.surchargeLabel, { amount: format.money(quote.surchargeMinor) })}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t border-border/40 pt-4 text-sm text-muted-foreground">
              {isFree ? (
                <p>{invite.result.freeNote}</p>
              ) : quote.isCustom ? (
                <>
                  <p>{invite.result.customNote}</p>
                  <p className="text-xs">{fill(invite.result.perGuestNote, { amount: beyond })}</p>
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
                range={`1 – ${format.number(EVENT_PRICING.freeTierGuests)}`}
                price={format.money(0)}
                active={isFree}
              />
              {EVENT_PRICING.tiers.map((tier, index) => {
                const lower =
                  index === 0 ? EVENT_PRICING.freeTierGuests + 1 : EVENT_PRICING.tiers[index - 1].maxGuests + 1;
                return (
                  <TierRow
                    key={tier.name}
                    name={tier.name}
                    range={`${format.number(lower)} – ${format.number(tier.maxGuests)}`}
                    price={format.money(priceIn(tier.price, format.currency))}
                    active={quote.tier === tier.name}
                  />
                );
              })}
              <TierRow
                name={`${lastTier.name} +`}
                range={`${format.number(lastTier.maxGuests + 1)}+`}
                price={fill(invite.modes.perGuest, { amount: beyond })}
                active={quote.isCustom}
              />
            </div>
          </div>
          <Button asChild size="lg" className="w-full rounded-full">
            <Link href={ROUTES.REGISTER}>
              {content.cta.primary}
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/[0.08] to-transparent p-6">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-primary" />
              {invite.pack.title}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight">
              {fill(invite.pack.price, { amount: format.money(priceIn(ORGANIZER_PACK.monthly, format.currency)) })}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{invite.pack.text}</p>
            <Button asChild variant="outline" className="mt-4 w-full rounded-full">
              <a href={salesMailto(invite.pack.mailSubject)}>{invite.pack.cta}</a>
            </Button>
          </div>
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
