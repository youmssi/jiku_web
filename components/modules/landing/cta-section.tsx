import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/shared";
import { ROUTES } from "@/lib/constants";
import type { LandingContent } from "./content";

export function CtaSection({ content }: { content: LandingContent["cta"] }) {
  return (
    <section className="border-t border-border/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary text-primary-foreground">
          {/* Content */}
          <div className="relative z-10 px-8 py-16 text-center sm:px-16 sm:py-24">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {content.heading}
              </h2>

              <p className="mx-auto mt-6 max-w-xl text-base text-primary-foreground/70 sm:text-lg">
                {content.text}
              </p>

              <div id="final-cta" className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" variant="secondary" className="group h-12 rounded-full px-8 text-base">
                  <TrackedLink
                    href={ROUTES.REGISTER}
                    eventName="cta_click"
                    eventProperties={{ location: "cta_section", label: content.primaryCta }}
                  >
                    {content.primaryCta}
                    <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </TrackedLink>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-primary-foreground/25 bg-transparent px-8 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <TrackedLink
                    href={ROUTES.LOGIN}
                    eventName="cta_click"
                    eventProperties={{ location: "cta_section", label: content.secondaryCta }}
                  >
                    {content.secondaryCta}
                  </TrackedLink>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
