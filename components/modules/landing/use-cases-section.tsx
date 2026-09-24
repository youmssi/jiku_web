import { ArrowRight, Building2, ClipboardCheck, Gem, Presentation, Scissors, Stethoscope, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { SEO_ROUTES } from "@/lib/constants";
import type { LandingContent } from "./content";
import { SectionHeading } from "./section-heading";

const CASE_ICONS: LucideIcon[] = [Gem, Presentation, ClipboardCheck, Stethoscope, Scissors, Building2];

export function UseCasesSection({ content, more }: { content: LandingContent["useCases"]; more: string }) {
  return (
    <section id="use-cases" className="scroll-mt-24 border-t border-border/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading badge={content.badge} heading={content.heading} subheading={content.subheading} />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.cases.map((useCase, index) => {
            const Icon = CASE_ICONS[index];
            return (
              <div key={useCase.title} className="flex gap-4 rounded-2xl border border-border/50 p-5">
                {Icon ? <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden /> : null}
                <div>
                  <h3 className="font-semibold">{useCase.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{useCase.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Button asChild variant="ghost">
            <Link href={SEO_ROUTES.USE_CASES}>
              {more}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
