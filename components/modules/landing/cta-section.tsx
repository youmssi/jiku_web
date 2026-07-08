"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function CtaSection() {
  const ref = useRef<HTMLElement>(null);
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
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="border-t border-border/40 py-24"
    >
      <div
        className={`mx-auto max-w-4xl px-6 text-center transition-all duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="size-3.5" />
          Get started today
        </div>

        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Ready to simplify your event management?
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Join thousands of organizers who trust Jikū to handle their
          invitations, ticketing, and check-in. Start free, upgrade when you
          grow.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full px-8 text-base shadow-lg shadow-primary/25"
          >
            <Link href={ROUTES.REGISTER}>
              Start free — no credit card
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-8 text-base">
            <Link href={ROUTES.LOGIN}>Sign in</Link>
          </Button>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Free tier includes up to 100 guests. 14-day trial on all paid plans.
        </p>
      </div>
    </section>
  );
}
