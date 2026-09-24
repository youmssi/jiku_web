import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal, SpotlightCard } from "@/components/effects";
import { cn } from "@/lib/utils";
import type { LandingFeature } from "./content";
import { SectionHeading, SoonBadge } from "./section-heading";

/**
 * One use of the product as a bento grid: the first capability gets the large
 * tile with a picture of the product, the others sit around it. Icons pair with
 * the items by position.
 */
export function BentoSection({
  id,
  content,
  icons,
  visual,
  soonLabel,
}: {
  id: string;
  content: { badge: string; heading: string; subheading: string; items: LandingFeature[] };
  icons: LucideIcon[];
  visual: ReactNode;
  soonLabel: string;
}) {
  const [lead, ...rest] = content.items;
  const LeadIcon = icons[0];

  return (
    <section id={id} className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading badge={content.badge} heading={content.heading} subheading={content.subheading} />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:auto-rows-fr lg:grid-cols-3">
          <Reveal className="sm:col-span-2 lg:row-span-2">
            <SpotlightCard className="flex h-full flex-col gap-6 bg-gradient-to-br from-primary/[0.07] via-card to-card p-8">
              <div>
                <div className="flex items-start justify-between gap-3">
                  {LeadIcon ? <TileIcon icon={LeadIcon} /> : null}
                  {lead.soon ? <SoonBadge label={soonLabel} /> : null}
                </div>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight">{lead.title}</h3>
                <p className="mt-2 max-w-md text-base leading-relaxed text-muted-foreground">{lead.description}</p>
              </div>
              <div className="flex flex-1 items-end pt-4">{visual}</div>
            </SpotlightCard>
          </Reveal>
          {rest.map((item, index) => {
            const Icon = icons[index + 1];
            return (
              <Reveal key={item.title} delay={(index % 3) * 0.06} className="h-full">
                <SpotlightCard className={cn("h-full", item.soon && "bg-muted/30")}>
                  <div className="flex items-start justify-between gap-3">
                    {Icon ? <TileIcon icon={Icon} /> : null}
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

function TileIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <Icon className="size-5" />
    </div>
  );
}
