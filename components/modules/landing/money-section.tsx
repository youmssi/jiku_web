import { ArrowRight, Ban, Check, Smartphone, Store } from "lucide-react";
import { JikūLogo } from "@/components/ui/jiku-logo";
import type { LandingContent } from "./content";
import { SectionHeading, SoonBadge } from "./section-heading";

/**
 * The two payment circuits, drawn: clients pay the organization directly, the
 * organization pays Jikū for its own service, and nothing crosses between them.
 */
export function MoneySection({ content, soonLabel }: { content: LandingContent["money"]; soonLabel: string }) {
  return (
    <section id="payments" className="scroll-mt-24 border-t border-border/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading badge={content.badge} heading={content.heading} subheading={content.subheading} />

        <div className="mt-14 grid gap-4 lg:grid-cols-2">
          <Circuit
            from={<Smartphone className="size-5" />}
            to={<Store className="size-5" />}
            title={content.clients.title}
            text={content.clients.text}
            tags={content.clients.methods}
            highlight
          />
          <Circuit
            from={<Store className="size-5" />}
            to={<JikūLogo variant="mark" className="size-5" />}
            title={content.platform.title}
            text={content.platform.text}
            tags={content.platform.items}
          />
        </div>

        <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-destructive/20 bg-destructive/5 px-5 py-2.5 text-sm font-medium">
          <Ban className="size-4 text-destructive" aria-hidden />
          {content.never}
        </div>

        <ul className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
          {content.points.map((point) => (
            <li key={point.text} className="flex items-start gap-3 rounded-2xl border border-border/50 p-4 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span className="flex-1">{point.text}</span>
              {point.soon ? <SoonBadge label={soonLabel} /> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Circuit({
  from,
  to,
  title,
  text,
  tags,
  highlight = false,
}: {
  from: React.ReactNode;
  to: React.ReactNode;
  title: string;
  text: string;
  tags: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] to-card p-8"
          : "rounded-3xl border border-border/50 bg-card p-8"
      }
    >
      <div aria-hidden className="flex items-center gap-3">
        <Node>{from}</Node>
        <span className="relative h-px flex-1 bg-gradient-to-r from-primary/60 to-primary/20">
          <ArrowRight className="absolute -top-2 right-0 size-4 text-primary" />
        </span>
        <Node>{to}</Node>
      </div>
      <h3 className="mt-8 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <li key={tag} className="rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium">
            {tag}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Node({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex size-11 items-center justify-center rounded-2xl border border-border/60 bg-background text-primary shadow-sm">
      {children}
    </span>
  );
}
