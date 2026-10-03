import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/shared";
import { ROUTES } from "@/lib/constants";
import { ClosingCta, CLOSING_OUTLINE } from "./closing-cta";
import type { LandingContent } from "./content";

export function CtaSection({ content }: { content: LandingContent["cta"] }) {
  return (
    <section id="final-cta" className="border-t border-border/30 px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <ClosingCta heading={content.heading} text={content.text}>
          <Button asChild size="lg" variant="secondary" className="group h-12 rounded-full px-8 text-base">
            <TrackedLink href={ROUTES.REGISTER} eventName="cta_click" eventProperties={{ location: "cta_section", label: content.primaryCta }}>
              {content.primaryCta}
              <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </TrackedLink>
          </Button>
          <Button asChild size="lg" variant="outline" className={CLOSING_OUTLINE}>
            <TrackedLink href={ROUTES.LOGIN} eventName="cta_click" eventProperties={{ location: "cta_section", label: content.secondaryCta }}>
              {content.secondaryCta}
            </TrackedLink>
          </Button>
        </ClosingCta>
      </div>
    </section>
  );
}
