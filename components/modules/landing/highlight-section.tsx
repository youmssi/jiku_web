import { Check, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/effects";
import { cn } from "@/lib/utils";
import type { LandingPoint } from "./content";
import { SectionHeading, SoonBadge } from "./section-heading";

/** A single idea told in two columns: the pitch on one side, its proof points on the other. */
export function HighlightSection({
  content,
  icon: Icon,
  soonLabel,
  reverse = false,
}: {
  content: { badge: string; heading: string; text: string; points: LandingPoint[] };
  icon: LucideIcon;
  soonLabel: string;
  reverse?: boolean;
}) {
  return (
    <section className="border-t border-border/30 py-24">
      <div
        className={cn(
          "mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2",
          reverse && "lg:[&>*:first-child]:order-2",
        )}
      >
        <div>
          <SectionHeading badge={content.badge} heading={content.heading} align="start" />
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">{content.text}</p>
        </div>
        <Reveal>
          <div className="rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-primary/[0.03] to-background p-8">
            <Icon className="size-10 text-primary" aria-hidden />
            <ul className="mt-6 space-y-4">
              {content.points.map((point) => (
                <li key={point.text} className="flex items-start gap-3">
                  <Check className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  <span className="flex-1 text-sm sm:text-base">{point.text}</span>
                  {point.soon ? <SoonBadge label={soonLabel} /> : null}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
