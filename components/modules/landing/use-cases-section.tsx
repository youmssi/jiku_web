import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SEO_ROUTES } from "@/lib/constants";
import type { LandingContent } from "./content";

/**
 * Who it is for, as one line of situations a visitor recognizes; the details
 * live on the use-cases page, so the landing does not repeat them.
 */
export function UseCasesSection({ content }: { content: LandingContent["useCases"] }) {
  return (
    <section id="use-cases" className="scroll-mt-24 border-t border-border/30 py-16">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p className="text-sm font-medium text-primary">{content.badge}</p>
        <h2 className="mt-2 text-balance text-2xl font-bold tracking-tight sm:text-3xl">{content.heading}</h2>
        <ul className="mt-8 flex flex-wrap justify-center gap-2">
          {content.cases.map((useCase) => (
            <li key={useCase}>
              <Link
                href={SEO_ROUTES.USE_CASES}
                className="inline-flex rounded-full border border-border/60 px-4 py-2 text-sm font-medium transition hover:border-primary/40"
              >
                {useCase}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href={SEO_ROUTES.USE_CASES}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
        >
          {content.more}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
