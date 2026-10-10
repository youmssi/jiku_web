import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SEO_ROUTES } from "@/lib/constants";
import type { LandingContent } from "./content";
import { SectionHeading } from "./section-heading";

/**
 * Who it is for, as one line of situations a visitor recognizes; the details
 * live on the use-cases page, so the landing does not repeat them.
 */
export function UseCasesSection({ content }: { content: LandingContent["useCases"] }) {
  return (
    <section id="use-cases" className="scroll-mt-24 border-t border-border/30 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <SectionHeading badge={content.badge} heading={content.heading} />
        <ul className="mt-10 flex flex-wrap justify-center gap-2 sm:mt-14">
          {content.cases.map((useCase) => (
            <li key={useCase.label}>
              <Link
                href={`${SEO_ROUTES.USE_CASES}#${useCase.anchor}`}
                className="inline-flex min-h-10 items-center rounded-full border border-border/60 px-4 text-sm font-medium transition hover:border-primary/40"
              >
                {useCase.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href={SEO_ROUTES.USE_CASES}
          className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
        >
          {content.more}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
