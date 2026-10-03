import { CountUp } from "@/components/effects";
import type { LandingContent } from "./content";

/** What the product guarantees, in four numbers counted up when they come into view. */
export function NumbersSection({ content }: { content: LandingContent["numbers"] }) {
  return (
    <section className="px-6 pb-16 sm:pb-24">
      <dl className="mx-auto grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-4">
        {content.map((fact) => (
          <div key={fact.label} className="flex flex-col-reverse bg-background px-6 py-8 text-center">
            <dt className="mt-2 text-sm text-muted-foreground">{fact.label}</dt>
            <dd className="text-4xl font-bold tracking-tight sm:text-5xl">
              <CountUp to={fact.value} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
