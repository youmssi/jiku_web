import { Building2, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { TrackedAnchor, TrackedLink, ViewTracker } from "@/components/shared";
import { ROUTES } from "@/lib/constants";
import { salesMailto } from "@/lib/support";
import type { LandingContent } from "./content";

/**
 * Pay-per-event pricing, mirroring the backend tier catalog defaults
 * (billing.free-tier-guests and billing.tiers in app/application.yaml). Every
 * feature is available at every tier — tiers only gate the guest count — so the
 * feature list is shared, not artificially split across cards.
 *
 * Laid out as a bento grid (see PricingSection): the highlighted tier becomes
 * a tall centerpiece cell on large screens, previewing the shared feature
 * list itself so the extra height reads as intentional rather than empty
 * padding.
 */
function TierCard({
  tier,
  perEvent,
  upToTemplate,
  highlightLabel,
  everyEventIncludes,
  className = "",
}: {
  tier: LandingContent["pricing"]["tiers"][number];
  perEvent: string;
  upToTemplate: string;
  highlightLabel: string;
  everyEventIncludes: string[];
  className?: string;
}) {
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border p-7 transition-all duration-500 ${
        tier.highlighted
          ? "border-primary/30 bg-gradient-to-b from-primary/[0.07] to-transparent shadow-xl shadow-primary/10"
          : "border-border/40 hover:border-primary/20 hover:shadow-lg"
      } ${className}`}
    >
      {tier.highlighted ? (
        <>
          <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute left-1/2 top-0 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-primary to-primary/80 px-4 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/25">
            <Sparkles className="size-3" />
            {highlightLabel}
          </div>
        </>
      ) : null}

      <div className={tier.highlighted ? "mb-6 mt-4" : "mb-6"}>
        <h3 className="text-lg font-semibold">{tier.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {upToTemplate.replace("{guests}", tier.guests)}
        </p>
      </div>

      <div className={tier.highlighted ? "relative mb-8" : "mb-8"}>
        <div className="whitespace-nowrap text-3xl font-bold tracking-tight sm:text-4xl">
          {tier.price}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{perEvent}</div>
      </div>

      {tier.highlighted ? (
        <ul className="relative mb-8 space-y-2.5">
          {everyEventIncludes.slice(0, 4).map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="relative mt-auto">
        <Button
          asChild
          variant={tier.highlighted ? "default" : "outline"}
          className="w-full rounded-full"
        >
          <TrackedLink
            href={ROUTES.REGISTER}
            eventName="cta_click"
            eventProperties={{ location: "pricing_tier", label: tier.name }}
          >
            {tier.cta}
          </TrackedLink>
        </Button>
      </div>
    </div>
  );
}

/**
 * The negotiated offer stands apart from the self-serve tiers: no per-event
 * price, capacity and terms set per client, on-premise hosting depending on the
 * offer, and the CTA reaches the sales mailbox instead of registration.
 */
function EnterpriseCard({
  enterprise,
  className = "",
}: {
  enterprise: LandingContent["pricing"]["enterprise"];
  className?: string;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border border-border/40 bg-card/50 p-7 transition-all duration-500 hover:border-primary/20 hover:shadow-lg ${className}`}
    >
      <div className="mb-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Building2 className="size-4 text-primary" />
          {enterprise.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{enterprise.capacity}</p>
      </div>

      <div className="mb-6">
        <div className="whitespace-nowrap text-3xl font-bold tracking-tight sm:text-4xl">
          {enterprise.priceLabel}
        </div>
      </div>

      <p className="mb-8 text-sm text-muted-foreground">{enterprise.description}</p>

      <div className="mt-auto">
        <Button asChild variant="outline" className="w-full rounded-full">
          <TrackedAnchor
            href={salesMailto(enterprise.mailSubject)}
            eventName="cta_click"
            eventProperties={{ location: "pricing_tier", label: enterprise.name }}
          >
            {enterprise.cta}
          </TrackedAnchor>
        </Button>
      </div>
    </div>
  );
}

/** Shared feature list — same features at every tier. */
function FeaturesCard({
  title,
  features,
  className = "",
}: {
  title: string;
  features: string[];
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col justify-center rounded-2xl border border-border/40 bg-card/50 p-7 ${className}`}
    >
      <p className="mb-4 text-sm font-semibold">{title}</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PricingSection({ content }: { content: LandingContent["pricing"] }) {
  const [free, bronze, argent, or] = content.tiers;

  return (
    <section id="pricing" className="border-t border-border/30 py-24">
      <ViewTracker eventName="pricing_view" eventProperties={{ source: "landing" }} />
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm shadow-primary/5">
            <JikūLogo variant="mark" className="size-3.5" />
            {content.badge}
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {content.heading}
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            {content.subheading}
          </p>
        </div>

        {/*
          Bento grid: a single column on mobile, a simple 2-column grid on
          tablet, and a 4-column grid with explicit row/column spans on
          desktop — the highlighted tier becomes a tall centerpiece cell
          spanning two rows, Or/Enterprise pair up beside it, and the shared
          feature list closes the grid full-width. `auto-rows-fr` (desktop
          only — it would force short mobile/tablet cards to an unwanted
          equal height) makes the two implicit rows equal, so the spanning
          centerpiece cell naturally reads as exactly twice as tall.
        */}
        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:auto-rows-fr">
          <TierCard
            tier={free}
            perEvent={content.perEvent}
            upToTemplate={content.upToTemplate}
            highlightLabel={content.highlightLabel}
            everyEventIncludes={content.everyEventIncludes}
            className="lg:col-start-1 lg:row-start-1"
          />
          <TierCard
            tier={bronze}
            perEvent={content.perEvent}
            upToTemplate={content.upToTemplate}
            highlightLabel={content.highlightLabel}
            everyEventIncludes={content.everyEventIncludes}
            className="lg:col-start-2 lg:row-start-1"
          />
          <TierCard
            tier={argent}
            perEvent={content.perEvent}
            upToTemplate={content.upToTemplate}
            highlightLabel={content.highlightLabel}
            everyEventIncludes={content.everyEventIncludes}
            className="sm:col-span-2 lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:row-span-2"
          />
          <TierCard
            tier={or}
            perEvent={content.perEvent}
            upToTemplate={content.upToTemplate}
            highlightLabel={content.highlightLabel}
            everyEventIncludes={content.everyEventIncludes}
            className="lg:col-start-4 lg:row-start-1"
          />
          <EnterpriseCard enterprise={content.enterprise} className="lg:col-start-4 lg:row-start-2" />
          <FeaturesCard
            title={content.everyEventIncludesTitle}
            features={content.everyEventIncludes}
            className="sm:col-span-2 lg:col-start-1 lg:col-span-2 lg:row-start-2"
          />
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
          {content.note}
        </p>
      </div>
    </section>
  );
}
