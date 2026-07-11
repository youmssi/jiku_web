import Link from "next/link";
import { Building2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { ROUTES } from "@/lib/constants";
import { salesMailto } from "@/lib/support";
import type { LandingContent } from "./content";

/**
 * Pay-per-event pricing, mirroring the backend tier catalog defaults
 * (billing.free-tier-guests and billing.tiers in app/application.yaml). Every
 * feature is available at every tier — tiers only gate the guest count — so the
 * feature list is shared, not artificially split across cards.
 */
function TierCard({
  tier,
  perEvent,
  upToTemplate,
  highlightLabel,
}: {
  tier: LandingContent["pricing"]["tiers"][number];
  perEvent: string;
  upToTemplate: string;
  highlightLabel: string;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-7 transition-all duration-500 ${
        tier.highlighted
          ? "border-primary/30 shadow-xl shadow-primary/10 lg:scale-105"
          : "border-border/40 hover:border-primary/20 hover:shadow-lg"
      }`}
    >
      {tier.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-primary/80 px-4 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/25">
          {highlightLabel}
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold">{tier.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {upToTemplate.replace("{guests}", tier.guests)}
        </p>
      </div>

      <div className="mb-8">
        <div className="whitespace-nowrap text-3xl font-bold tracking-tight sm:text-4xl">
          {tier.price}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{perEvent}</div>
      </div>

      <div className="mt-auto">
        <Button
          asChild
          variant={tier.highlighted ? "default" : "outline"}
          className="w-full rounded-full"
        >
          <Link href={ROUTES.REGISTER}>{tier.cta}</Link>
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
    <div className="relative flex flex-col rounded-2xl border border-border/40 bg-card/50 p-7 transition-all duration-500 hover:border-primary/20 hover:shadow-lg">
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
          <a href={salesMailto(enterprise.mailSubject)}>{enterprise.cta}</a>
        </Button>
      </div>
    </div>
  );
}

export function PricingSection({ content }: { content: LandingContent["pricing"] }) {
  return (
    <section id="pricing" className="border-t border-border/30 py-24">
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

        <div className="mx-auto mt-16 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          {content.tiers.map((tier) => (
            <TierCard
              key={tier.name}
              tier={tier}
              perEvent={content.perEvent}
              upToTemplate={content.upToTemplate}
              highlightLabel={content.highlightLabel}
            />
          ))}
          <EnterpriseCard enterprise={content.enterprise} />
        </div>

        {/* Shared feature list — same features at every tier */}
        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-border/40 bg-card/50 p-7">
          <p className="mb-4 text-sm font-semibold">{content.everyEventIncludesTitle}</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {content.everyEventIncludes.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
          {content.note}
        </p>
      </div>
    </section>
  );
}
