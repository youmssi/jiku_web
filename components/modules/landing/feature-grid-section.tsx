import type { LucideIcon } from "lucide-react";
import { Reveal, SpotlightCard } from "@/components/effects";
import type { LandingFeature } from "./content";
import { SectionHeading, SoonBadge } from "./section-heading";

/**
 * One use of the product (events or services) as a grid of capabilities. Icons
 * pair with the items by position; an item without one simply shows none.
 */
export function FeatureGridSection({
  id,
  content,
  icons,
  soonLabel,
}: {
  id: string;
  content: { badge: string; heading: string; subheading: string; items: LandingFeature[] };
  icons: LucideIcon[];
  soonLabel: string;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading badge={content.badge} heading={content.heading} subheading={content.subheading} />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.items.map((item, index) => {
            const Icon = icons[index];
            return (
              <Reveal key={item.title} delay={(index % 3) * 0.08}>
                <SpotlightCard className="h-full">
                  <div className="flex items-start justify-between gap-3">
                    {Icon ? (
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>
                    ) : null}
                    {item.soon ? <SoonBadge label={soonLabel} /> : null}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
