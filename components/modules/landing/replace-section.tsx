import { ArrowRight, Check, X } from "lucide-react";
import { Reveal } from "@/components/effects";
import type { LandingContent } from "./content";
import { SectionHeading } from "./section-heading";

/** What a visitor patches together today, set against what Jikū gives them, row by row. */
export function ReplaceSection({ content }: { content: LandingContent["replace"] }) {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading badge={content.badge} heading={content.heading} subheading={content.subheading} />
        <div className="mt-14 overflow-hidden rounded-3xl border border-border/50">
          <div className="hidden grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-border/50 bg-muted/40 px-6 py-3 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase sm:grid">
            <span>{content.beforeLabel}</span>
            <span className="w-5" />
            <span className="text-foreground">{content.afterLabel}</span>
          </div>
          <ul>
            {content.rows.map((row, index) => (
              <Reveal key={row.after} delay={index * 0.05}>
                <li className="grid gap-2 border-b border-border/40 px-6 py-5 last:border-b-0 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
                  <span className="flex items-start gap-3 text-sm text-muted-foreground">
                    <X className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" aria-label={content.beforeLabel} />
                    <span className="line-through decoration-muted-foreground/30">{row.before}</span>
                  </span>
                  <ArrowRight className="hidden size-5 text-primary/50 sm:block" aria-hidden />
                  <span className="flex items-start gap-3 text-sm font-medium sm:text-base">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-label={content.afterLabel} />
                    {row.after}
                  </span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
