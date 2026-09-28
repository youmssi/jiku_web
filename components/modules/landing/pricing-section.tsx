import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { salesMailto } from "@/lib/support";
import { cn } from "@/lib/utils";
import type { LandingContent, LandingLocale } from "./content";
import { priceAnchor } from "./price-anchor";
import { SectionHeading } from "./section-heading";

/**
 * One number per use and the way to the exact figure. The detail (tiers,
 * plans, commission) lives in the simulator only, so it is never repeated.
 */
export function PricingSection({ content, locale }: { content: LandingContent["pricing"]; locale: LandingLocale }) {
  return (
    <section id="pricing" className="scroll-mt-24 border-t border-border/30 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading badge={content.badge} heading={content.heading} subheading={content.subheading} />

        <div className="mt-10 sm:mt-14 grid gap-5 md:grid-cols-3">
          {content.plans.map((plan) => (
            <Card key={plan.name} className={cn("flex flex-col", plan.highlighted && "border-primary shadow-lg shadow-primary/10")}>
              <CardHeader className="flex-1">
                <CardTitle className="text-base">{plan.name}</CardTitle>
                <p className="mt-3 text-4xl font-bold tracking-tight">{plan.price}</p>
                <CardDescription className="mt-1">{plan.caption.replace("{price}", priceAnchor(plan.anchor, locale))}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                  <Link href={plan.href}>
                    {plan.cta}
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {content.enterprise.text}{" "}
          <a href={salesMailto(content.enterprise.mailSubject)} className="font-semibold text-foreground underline-offset-4 hover:underline">
            {content.enterprise.cta}
          </a>
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">{content.note}</p>
      </div>
    </section>
  );
}
