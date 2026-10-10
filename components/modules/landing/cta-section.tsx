import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackedAnchor, TrackedLink } from "@/components/shared";
import { ROUTES } from "@/lib/constants";
import { supportMailto, supportWhatsAppLink } from "@/lib/support";
import { ClosingCta, CLOSING_OUTLINE } from "./closing-cta";
import type { LandingContent } from "./content";

/** The closing action, and a human to ask for whoever is not ready yet (JIKU-229). */
export function CtaSection({ content }: { content: LandingContent["cta"] }) {
  const whatsApp = supportWhatsAppLink();
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
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {content.contact.question}{" "}
          <TrackedAnchor
            href={whatsApp ?? supportMailto()}
            {...(whatsApp ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            eventName={whatsApp ? "whatsapp_click" : "cta_click"}
            eventProperties={{ location: "cta_section", label: "contact" }}
            className="inline-flex min-h-11 items-center font-semibold text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
          >
            {whatsApp ? content.contact.whatsApp : content.contact.email}
          </TrackedAnchor>
        </p>
      </div>
    </section>
  );
}
