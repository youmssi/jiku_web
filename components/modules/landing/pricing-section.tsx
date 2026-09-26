import { ArrowRight, Building2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { salesMailto } from "@/lib/support";
import { cn } from "@/lib/utils";
import type { LandingContent } from "./content";
import { SectionHeading, SoonBadge } from "./section-heading";

/** Three simple lines, one per use, and the way to the exact figure. */
export function PricingSection({ content, soonLabel }: { content: LandingContent["pricing"]; soonLabel: string }) {
  return (
    <section id="pricing" className="scroll-mt-24 border-t border-border/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading badge={content.badge} heading={content.heading} subheading={content.subheading} />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {content.plans.map((plan) => (
            <Card key={plan.name} className={cn("flex flex-col", plan.highlighted && "border-primary shadow-lg shadow-primary/10")}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  {plan.soon ? <SoonBadge label={soonLabel} /> : null}
                </div>
                <p className="mt-3 text-4xl font-bold tracking-tight">{plan.price}</p>
                <CardDescription>{plan.caption}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
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

        <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl border border-border/50 p-6 sm:flex-row sm:items-center">
          <Building2 className="size-6 shrink-0 text-primary" aria-hidden />
          <div className="flex-1">
            <p className="font-semibold">{content.enterprise.title}</p>
            <p className="text-sm text-muted-foreground">{content.enterprise.text}</p>
          </div>
          <Button asChild variant="outline">
            <a href={salesMailto(content.enterprise.mailSubject)}>{content.enterprise.cta}</a>
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">{content.note}</p>
      </div>
    </section>
  );
}
