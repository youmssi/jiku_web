"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { useOnScreen } from "@/hooks/use-on-screen";
import { ROUTES } from "@/lib/constants";

// ─── Data ─────────────────────────────────────────────────────────
interface PricingTier {
  name: string;
  description: string;
  monthly: string;
  yearly: string;
  period: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}

const TIERS: PricingTier[] = [
  {
    name: "Free",
    description: "Perfect for testing the waters with small events.",
    monthly: "$0",
    yearly: "$0",
    period: "/month",
    features: [
      "Up to 100 guests per event",
      "Email invitations",
      "QR ticket generation",
      "Basic check-in",
      "CSV guest import",
      "Standard support",
    ],
    highlighted: false,
    cta: "Start free",
  },
  {
    name: "Pro",
    description: "For growing organizers who need more reach.",
    monthly: "$29",
    yearly: "$19",
    period: "/month",
    features: [
      "Up to 2,000 guests per event",
      "Email & WhatsApp invitations",
      "Offline-capable check-in",
      "White-label branding",
      "Real-time dashboard",
      "Priority support",
    ],
    highlighted: true,
    cta: "Start trial",
  },
  {
    name: "Enterprise",
    description: "For agencies and large-scale events.",
    monthly: "$99",
    yearly: "$79",
    period: "/month",
    features: [
      "Unlimited guests per event",
      "All communication channels",
      "Custom subdomain or domain",
      "Advanced analytics & exports",
      "Dedicated account manager",
      "99.9% SLA guarantee",
    ],
    highlighted: false,
    cta: "Contact sales",
  },
];

// ─── Pricing Card ─────────────────────────────────────────────────
function PricingCard({ tier, index, yearly }: { tier: PricingTier; index: number; yearly: boolean }) {
  const { ref, visible } = useOnScreen(0.1);
  const price = yearly ? tier.yearly : tier.monthly;
  const savings = tier.monthly !== "$0" && tier.yearly !== tier.monthly
    ? `Save $${(parseInt(tier.monthly.replace("$", "")) - parseInt(tier.yearly.replace("$", ""))) * 12}/yr`
    : null;

  return (
    <div
      ref={ref}
      className={`group relative flex flex-col rounded-2xl border bg-card/50 p-8 transition-all duration-700 ${
        tier.highlighted
          ? "border-primary/30 shadow-xl shadow-primary/10 scale-[1.02] lg:scale-105"
          : "border-border/40 hover:border-primary/20 hover:shadow-lg"
      }`}
      style={{
        transitionDelay: `${index * 100}ms`,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Most popular badge */}
      {tier.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-primary/80 px-4 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/25">
          Most popular
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold">{tier.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
      </div>

      {/* Price */}
      <div className="mb-8 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight">{price}</span>
        <span className="text-sm text-muted-foreground">{tier.period}</span>
        {savings && (
          <span className="ml-auto rounded-full bg-green-500/10 px-2.5 py-0.5 text-[11px] font-medium text-green-600 dark:text-green-400">
            {savings}
          </span>
        )}
      </div>

      {/* Features */}
      <ul className="mb-8 flex-1 space-y-3.5">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        asChild
        variant={tier.highlighted ? "default" : "outline"}
        className={`w-full rounded-full ${
          tier.highlighted
            ? "bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/15"
            : ""
        }`}
      >
        <Link href={tier.highlighted ? ROUTES.REGISTER : ROUTES.LOGIN}>
          {tier.cta}
        </Link>
      </Button>
    </div>
  );
}

// ─── Toggle component ─────────────────────────────────────────────
function BillingToggle({ yearly, onChange }: { yearly: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-border/30 bg-card/50 p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
          !yearly
            ? "bg-foreground text-background shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
          yearly
            ? "bg-foreground text-background shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Yearly
        <span className="ml-1.5 rounded-full bg-green-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400">
          -34%
        </span>
      </button>
    </div>
  );
}

// ─── Pricing Section ──────────────────────────────────────────────
export function PricingSection() {
  const [yearly, setYearly] = useState(false);
  const { ref, visible } = useOnScreen(0.1);

  return (
    <section id="pricing" className="border-t border-border/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div
          ref={ref}
          className="mx-auto max-w-2xl text-center transition-all duration-700"
          style={{
            transform: visible ? "translateY(0)" : "translateY(24px)",
            opacity: visible ? 1 : 0,
          }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm shadow-primary/5">
            <JikūLogo variant="mark" className="size-3.5" />
            Simple pricing
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Pay only for what you need
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Start free and upgrade as your events grow. No hidden fees, no
            surprise charges.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 flex justify-center">
            <BillingToggle yearly={yearly} onChange={setYearly} />
          </div>
        </div>

        {/* Pricing cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3 lg:mx-auto lg:max-w-5xl">
          {TIERS.map((tier, i) => (
            <PricingCard key={tier.name} tier={tier} index={i} yearly={yearly} />
          ))}
        </div>

        {/* Footnote */}
        <p className="mt-10 text-center text-sm text-muted-foreground">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
