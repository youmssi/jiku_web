import { CountUp } from "@/components/effects";
import type { LandingContent } from "./content";

/** Figures that are true today, counted up once as they come into view. */
export function ProofSection({ content, locale }: { content: LandingContent["proof"]; locale: string }) {
  return (
    <section aria-label="Jikū" className="border-y border-border/30 bg-muted/30">
      <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 lg:grid-cols-4">
        {content.map((item) => (
          <div key={item.label} className="text-center">
            <dt className="sr-only">{item.label}</dt>
            <dd className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
              <CountUp value={item.value} locale={locale} />
              {item.suffix}
            </dd>
            <dd className="mx-auto mt-2 max-w-[16rem] text-sm text-muted-foreground">{item.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
