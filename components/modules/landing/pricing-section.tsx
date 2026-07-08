"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";

interface PricingTier {
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}

const TIERS: PricingTier[] = [
  {
    name: "Free",
    description: "Perfect for testing the waters with small events.",
    price: "$0",
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
    price: "$29",
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
    price: "$99",
    period: "/month",
    features: [
      "Unlimited guests per event",
      "All communication channels",
      "Custom subdomain or domain",
      "Advanced analytics",
      "Dedicated account manager",
      "99.9% SLA guarantee",
    ],
    highlighted: false,
    cta: "Contact sales",
  },
];

function PricingCard({ tier, index }: { tier: PricingTier; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Card
      ref={ref}
      className={`relative flex flex-col border-border/50 transition-all duration-700 ${
        tier.highlighted
          ? "border-primary/40 shadow-xl shadow-primary/10 scale-105"
          : "hover:border-primary/30"
      } ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-100"}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {tier.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
          Most popular
        </div>
      )}

      <CardContent className="flex flex-col gap-6 p-6">
        <div>
          <CardTitle className="text-xl">{tier.name}</CardTitle>
          <CardDescription className="mt-1 text-sm text-muted-foreground">
            {tier.description}
          </CardDescription>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
          <span className="text-sm text-muted-foreground">{tier.period}</span>
        </div>

        <ul className="flex-1 space-y-3">
          {tier.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          asChild
          variant={tier.highlighted ? "default" : "outline"}
          className={`w-full rounded-full ${tier.highlighted ? "shadow-lg shadow-primary/25" : ""}`}
        >
          <Link href={ROUTES.REGISTER}>{tier.cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function PricingSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const [headingVisible, setHeadingVisible] = useState(false);

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeadingVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing" className="border-t border-border/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div
          ref={headingRef}
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${
            headingVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            Simple pricing
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Pay only for what you need
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free and upgrade as your events grow. No hidden fees, no
            surprise charges.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3 lg:mx-auto lg:max-w-5xl">
          {TIERS.map((tier, i) => (
            <PricingCard key={tier.name} tier={tier} index={i} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
