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
 * feature list is stated once, below the cards, rather than repeated inside them.
 *
 * The capacity and price captions come from the content per tier rather than
 * from one shared template: the free allowance accumulates across an account
 * over a rolling year, the paid tiers apply to a single event, and wording both
 * the same way misdescribes what the customer is buying.
 */
function TierCard({
  tier,
  highlightLabel,
}: {
  tier: LandingContent["pricing"]["tiers"][number];
  highlightLabel: string;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-7 transition-all duration-300 ${
        tier.highlighted
          ? "border-primary/30 bg-gradient-to-b from-primary/[0.07] to-transparent shadow-xl shadow-primary/10"
          : "border-border/40 hover:border-primary/20 hover:shadow-lg"
      }`}
    >
      {tier.highlighted ? (
        <>
          {/*
            The glow is clipped to the card, but the card itself must not clip:
            the "most common" badge is deliberately centred on the top border and
            an overflow-hidden card would cut it in half.
          */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl" />
          </div>
          <div className="absolute left-1/2 top-0 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-primary to-primary/80 px-4 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/25">
            <Sparkles className="size-3" />
            {highlightLabel}
          </div>
        </>
      ) : null}

      <div className="relative mb-6">
        <h3 className="text-lg font-semibold">{tier.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{tier.capacity}</p>
      </div>

      <div className="relative mb-8">
        {/*
          The amount must never wrap: "150 000 GNF" broken across two lines reads
          as a layout fault on the one element the visitor is scanning for. The
          four-column row leaves roughly 230px of card width, which text-3xl
          fits and text-4xl does not — so the larger size only applies where the
          cards are wider than that.
        */}
        <div className="whitespace-nowrap text-3xl font-bold tracking-tight sm:text-4xl lg:text-3xl">
          {tier.price}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{tier.priceCaption}</div>
      </div>

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
function EnterpriseCard({ enterprise }: { enterprise: LandingContent["pricing"]["enterprise"] }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border/40 bg-card/50 p-7 transition-all duration-300 hover:border-primary/20 hover:shadow-lg">
      <div className="mb-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Building2 className="size-4 text-primary" />
          {enterprise.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{enterprise.capacity}</p>
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold tracking-tight sm:text-4xl">
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

/** Shared feature list — the same features at every tier, stated once. */
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
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">{content.subheading}</p>
        </div>

        {/*
          One row of equal-height self-serve tiers, then a band pairing the
          negotiated offer with the shared feature list. Cards stretch to the
          tallest in their row, so the grid stays even however the copy is
          translated — no explicit row/column placement to break at a breakpoint,
          and `mt-20` leaves the highlighted card's badge room to sit above it.
        */}
        <div className="mx-auto mt-20 grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {content.tiers.map((tier) => (
            <TierCard key={tier.name} tier={tier} highlightLabel={content.highlightLabel} />
          ))}
        </div>

        <div className="mx-auto mt-5 grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-3">
          <EnterpriseCard enterprise={content.enterprise} />
          <FeaturesCard
            title={content.everyEventIncludesTitle}
            features={content.everyEventIncludes}
            className="lg:col-span-2"
          />
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
          {content.note}
        </p>
      </div>
    </section>
  );
}
