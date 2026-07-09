import { Check, Gem, Presentation, Ticket, type LucideIcon } from "lucide-react";
import { JikūLogo } from "@/components/ui/jiku-logo";
import type { LandingContent } from "./content";

// Icons pair positionally with content.cases (weddings, conferences, galas).
const CASE_ICONS: LucideIcon[] = [Gem, Presentation, Ticket];

function UseCaseCard({
  title,
  description,
  index,
}: {
  title: string;
  description: string;
  index: number;
}) {
  const Icon = CASE_ICONS[index];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 p-7 transition-all duration-500 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
      <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary/15 group-hover:scale-110">
        <Icon className="size-6" />
      </div>
      <h3 className="mb-2 text-base font-semibold tracking-tight">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

/**
 * Real product truths only: what the product does today, framed by event type.
 * Replaces an earlier testimonials section — real organizer quotes belong here
 * once UAT (JIKU-40) produces them, never invented ones.
 */
export function UseCasesSection({ content }: { content: LandingContent["useCases"] }) {
  return (
    <section className="border-t border-border/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm shadow-primary/5">
            <JikūLogo variant="mark" className="size-3.5" />
            {content.badge}
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {content.heading}
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            {content.subheading}
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {content.cases.map((useCase, i) => (
            <UseCaseCard
              key={useCase.title}
              title={useCase.title}
              description={useCase.description}
              index={i}
            />
          ))}
        </div>

        {/* Trust bar — only claims the product can evidence */}
        <div className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
          {content.trustBar.map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-green-500" strokeWidth={2.5} />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
