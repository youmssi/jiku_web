import { BadgeCheck, UserRoundCheck, Wallet, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/effects";
import type { LandingContent } from "./content";
import { SectionHeading } from "./section-heading";

const ICONS: LucideIcon[] = [UserRoundCheck, Wallet, BadgeCheck];

/** What an organizer needs to trust before handing over the door: the team, the money, the brand. */
export function TrustSection({ content }: { content: LandingContent["trust"] }) {
  return (
    <section id="trust" className="scroll-mt-24 border-t border-border/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading badge={content.badge} heading={content.heading} />
        <div className="mt-10 sm:mt-14 grid gap-5 md:grid-cols-3">
          {content.items.map((item, index) => {
            const Icon = ICONS[index];
            return (
              <Reveal key={item.title} delay={index * 0.06}>
                <div className="h-full rounded-2xl border border-border/50 p-6">
                  {Icon ? (
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden />
                    </div>
                  ) : null}
                  <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                  {index === 1 ? (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {content.methods.map((method) => (
                        <li key={method} className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium">
                          {method}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
