"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { ROUTES } from "@/lib/constants";

export function CtaSection() {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(el); } },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section ref={ref} className="border-t border-border/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div
          className="relative overflow-hidden rounded-3xl border border-border/30 bg-gradient-to-br from-primary/5 via-primary/[0.02] to-background transition-all duration-700"
          onMouseMove={handleMouseMove}
          style={{
            transform: isVisible ? "translateY(0)" : "translateY(24px)",
            opacity: isVisible ? 1 : 0,
          }}
        >
          {/* Spotlight effect */}
          <div
            className="pointer-events-none absolute inset-0 opacity-30 transition-opacity duration-300"
            style={{
              background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, hsla(var(--primary), 0.12), transparent 40%)`,
            }}
          />

          {/* Decorative lines */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-0 h-px w-32 bg-gradient-to-r from-primary/30 to-transparent" />
            <div className="absolute right-0 top-0 h-32 w-px bg-gradient-to-b from-primary/30 to-transparent" />
            <div className="absolute bottom-0 left-0 h-32 w-px bg-gradient-to-t from-primary/30 to-transparent" />
            <div className="absolute bottom-0 right-0 h-px w-32 bg-gradient-to-l from-primary/30 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 px-8 py-16 text-center sm:px-16 sm:py-24">
            <div className="mx-auto max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm shadow-primary/5">
                <JikūLogo variant="mark" className="size-3.5" />
                Get started today
              </div>

              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Ready to simplify your
                <br />
                event management?
              </h2>

              <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
                Join thousands of organizers who trust Jikū to handle their
                invitations, ticketing, and check-in. Start free, upgrade when
                you grow.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="group relative h-12 overflow-hidden rounded-full px-8 text-base shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
                >
                  <Link href={ROUTES.REGISTER}>
                    <span className="relative z-10 flex items-center gap-2">
                      Start free — no credit card
                      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                    <span className="absolute inset-0 z-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full px-8 text-base"
                >
                  <Link href={ROUTES.LOGIN}>Sign in</Link>
                </Button>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                Free tier includes up to 100 guests. 14-day trial on all paid plans.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
