import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { ROUTES } from "@/lib/constants";
import type { LandingContent } from "./content";

export function CtaSection({ content }: { content: LandingContent["cta"] }) {
  return (
    <section className="border-t border-border/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/30 bg-gradient-to-br from-primary/5 via-primary/[0.02] to-background">
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
                {content.badge}
              </div>

              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {content.heading}
              </h2>

              <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
                {content.text}
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="group relative h-12 overflow-hidden rounded-full px-8 text-base shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
                >
                  <Link href={ROUTES.REGISTER}>
                    <span className="relative z-10 flex items-center gap-2">
                      {content.primaryCta}
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
                  <Link href={ROUTES.LOGIN}>{content.secondaryCta}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
