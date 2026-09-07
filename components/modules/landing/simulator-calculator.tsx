"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Link } from "@/i18n/navigation";
import { RESERVE_ROUTE, SEO_ROUTES } from "@/lib/constants";
import { usdApprox, PRICING, quoteForGuests, FREE_TIER, CUSTOM_TIER } from "@/lib/pricing";
import { salesMailto } from "@/lib/support";
import { cn } from "@/lib/utils";
import type { SimulatorContent, SimulatorPlan } from "./simulator-content";

const SLIDER_MAX = 2000;
const DEFAULT_GUESTS = 150;

type Mode = "event" | "subscription";

function tierLabel(tier: string, content: SimulatorContent): string {
  if (tier === FREE_TIER) return content.event.result.freeLabel;
  if (tier === CUSTOM_TIER) return "CUSTOM";
  return tier;
}

/**
 * The pricing playground, split by need: an interactive event price estimator
 * and the indicative appointment-subscription grid. Prices show GNF with a
 * small approximate USD figure; the guarantee strip explains the deposit and
 * refund rules so a visitor never wonders what they would actually pay.
 */
export function SimulatorCalculator({
  content,
  locale,
}: {
  content: SimulatorContent;
  locale: "fr" | "en";
}) {
  const [mode, setMode] = useState<Mode>("event");

  const money = (minor: number) =>
    `${minor.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")} GNF`;
  const usd = (minor: number) =>
    `${content.usdPrefix}${usdApprox(minor).toLocaleString(locale === "fr" ? "fr-FR" : "en-US", {
      maximumFractionDigits: 0,
    })}`;

  return (
    <div>
      {/* Mode switch */}
      <div className="mx-auto flex w-fit rounded-full border border-border/40 bg-muted/40 p-1">
        <ModeButton
          active={mode === "event"}
          onClick={() => setMode("event")}
          label={content.tabs.event}
        />
        <ModeButton
          active={mode === "subscription"}
          onClick={() => setMode("subscription")}
          label={content.tabs.subscription}
        />
      </div>

      {mode === "event" ? (
        <EventMode content={content} locale={locale} money={money} usd={usd} />
      ) : (
        <SubscriptionMode content={content} money={money} usd={usd} />
      )}

      <div className="mt-10 flex items-start gap-3 rounded-2xl border border-border/40 bg-card/50 p-5">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold">{content.guarantee.heading}</p>
          <p className="mt-1 text-sm text-muted-foreground">{content.guarantee.text}</p>
        </div>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-5",
        active
          ? "bg-foreground text-background shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function EventMode({
  content,
  locale,
  money,
  usd,
}: {
  content: SimulatorContent;
  locale: "fr" | "en";
  money: (n: number) => string;
  usd: (n: number) => string;
}) {
  const [guestCount, setGuestCount] = useState(DEFAULT_GUESTS);
  const quote = useMemo(() => quoteForGuests(guestCount), [guestCount]);
  const isFree = quote.tier === FREE_TIER;

  const reserveHref = `${RESERVE_ROUTE}?guests=${guestCount}`;
  const guestsWord = locale === "fr" ? "invités" : "guests";
  const quoteHref = salesMailto(
    `${content.event.cta.quoteSubjectPrefix} ${guestCount} ${guestsWord}`,
  );

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="rounded-3xl border border-border/40 bg-card/50 p-8">
        <label htmlFor="simulator-guests" className="text-sm font-medium text-muted-foreground">
          {content.event.input.label}
        </label>
        <div className="mt-4 flex items-center gap-4">
          <Slider
            value={[guestCount]}
            min={1}
            max={SLIDER_MAX}
            step={1}
            onValueChange={(value) => setGuestCount(value[0])}
            aria-label={content.event.input.label}
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
        <p className="mt-2 text-xs text-muted-foreground">{content.event.input.helper}</p>

        <div className="mt-8 rounded-2xl border border-primary/15 bg-primary/5 p-6">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{content.event.result.tierLabel}</p>
              <p className="mt-1 text-xl font-semibold tracking-tight">
                {tierLabel(quote.tier, content)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{content.event.result.totalLabel}</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">
                {money(quote.totalMinor)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{usd(quote.totalMinor)}</p>
            </div>
          </div>

          {isFree ? (
            <p className="mt-4 text-sm text-muted-foreground">{content.event.result.freeNote}</p>
          ) : quote.isCustom ? (
            <>
              <p className="mt-4 text-sm text-muted-foreground">{content.event.result.customNote}</p>
              <p className="mt-2 text-xs text-muted-foreground">{content.event.result.perGuestNote}</p>
            </>
          ) : (
            <>
              <div className="mt-4 flex items-baseline justify-between border-t border-border/40 pt-4">
                <p className="text-sm text-muted-foreground">
                  {content.event.result.depositLabel}
                </p>
                <div className="text-right">
                  <p className="text-base font-semibold">{money(quote.depositMinor)}</p>
                  <p className="text-xs text-muted-foreground">{usd(quote.depositMinor)}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {content.event.result.depositNote}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="rounded-3xl border border-border/40 bg-card/50 p-6">
          <p className="text-sm font-semibold">{content.event.ladder.heading}</p>
          <p className="mt-1 text-xs text-muted-foreground">{content.event.ladder.note}</p>
          <div className="mt-5 space-y-2">
            <TierRow
              name={content.event.result.freeLabel}
              range={`1 - ${PRICING.freeTierGuests}`}
              price={money(0)}
              active={quote.tier === FREE_TIER}
            />
            {PRICING.tiers.map((tier, i) => {
              const lower =
                i === 0 ? PRICING.freeTierGuests + 1 : PRICING.tiers[i - 1].maxGuests + 1;
              return (
                <TierRow
                  key={tier.name}
                  name={tier.name}
                  range={`${lower} - ${tier.maxGuests}`}
                  price={money(tier.priceMinor)}
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
          {quote.isCustom ? (
            <>
              <p className="text-lg font-semibold">{content.event.cta.quoteCta}</p>
              <p className="mt-2 text-sm text-muted-foreground">{content.event.result.customNote}</p>
              <Button asChild size="lg" className="mt-5 w-full rounded-full">
                <a href={quoteHref}>
                  {content.event.cta.quoteCta}
                  <ArrowRight className="ml-2 size-4" />
                </a>
              </Button>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold">{content.event.cta.heading}</p>
              <p className="mt-2 text-sm text-muted-foreground">{content.event.cta.text}</p>
              <Button asChild size="lg" className="mt-5 w-full rounded-full">
                <Link href={reserveHref}>
                  {content.event.cta.primary}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </>
          )}
          <Button asChild variant="outline" className="mt-3 w-full rounded-full">
            <Link href={SEO_ROUTES.USE_CASES}>{content.event.cta.secondary}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function SubscriptionMode({
  content,
  money,
  usd,
}: {
  content: SimulatorContent;
  money: (n: number) => string;
  usd: (n: number) => string;
}) {
  const { subscription } = content;

  return (
    <div className="mt-10">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
          {subscription.badge}
        </span>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {subscription.intro}
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {subscription.plans.map((plan) => (
          <SubscriptionCard key={plan.id} plan={plan} money={money} usd={usd} />
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-3xl rounded-xl border border-border/40 bg-card/50 p-4 text-center text-xs text-muted-foreground">
        {subscription.whatsappNote}
      </p>
    </div>
  );
}

function SubscriptionCard({
  plan,
  money,
  usd,
}: {
  plan: SimulatorPlan;
  money: (n: number) => string;
  usd: (n: number) => string;
}) {
  const priceDefined = plan.monthlyPerUser !== undefined;
  const isFree = plan.monthlyPerUser === 0;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border p-6 transition-all duration-300",
        plan.highlight
          ? "border-primary/30 bg-gradient-to-b from-primary/[0.07] to-transparent shadow-xl shadow-primary/10"
          : "border-border/40 bg-card/50 hover:border-primary/20 hover:shadow-lg",
      )}
    >
      <h3 className="text-lg font-semibold">{plan.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{plan.audience}</p>

      <div className="mt-5 min-h-16">
        {!priceDefined ? (
          <p className="text-2xl font-bold tracking-tight">{plan.priceCaption}</p>
        ) : isFree ? (
          <>
            <p className="text-3xl font-bold tracking-tight">{money(0)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{plan.priceCaption}</p>
          </>
        ) : (
          <>
            <p className="whitespace-nowrap text-2xl font-bold tracking-tight">
              {money(plan.monthlyPerUser!)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{plan.priceCaption}</p>
            <p className="mt-1 text-xs text-muted-foreground">{usd(plan.monthlyPerUser!)}</p>
          </>
        )}
      </div>

      {plan.yearlyPerUser !== undefined ? (
        <p className="mt-3 rounded-lg bg-primary/5 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          {plan.annualNote}
        </p>
      ) : null}

      <ul className="mt-5 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            {feature}
          </li>
        ))}
      </ul>

      <Button
        asChild
        variant={plan.highlight ? "default" : "outline"}
        className="mt-6 w-full rounded-full"
      >
        <a href={salesMailto(plan.mailSubject)}>{plan.cta}</a>
      </Button>
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
      className={cn(
        "flex items-center justify-between rounded-xl border px-4 py-3 text-sm",
        active ? "border-primary/40 bg-primary/10" : "border-border/40",
      )}
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
