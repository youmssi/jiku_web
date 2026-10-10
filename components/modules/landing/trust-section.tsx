import { ArrowRight, BadgeCheck, UserRoundCheck, Wallet, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/effects";
import { VerifiedBadge } from "@/components/shared";
import { Link } from "@/i18n/navigation";
import { PRIVACY_ROUTE, TERMS_ROUTE } from "@/lib/constants";
import type { LandingContent } from "./content";
import { SectionHeading } from "./section-heading";

const ICONS: LucideIcon[] = [UserRoundCheck, Wallet, BadgeCheck];

/**
 * What an organizer needs to trust before handing over the door: the team, the
 * money, the brand, with the badge guests really see and the written
 * commitments behind each claim (JIKU-229).
 */
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
                        <li key={method} className="rounded-full border border-border/60 px-3 py-1 text-sm font-medium">
                          {method}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {index === 2 ? <VerifiedBadge kind="COMPANY" className="mt-4" /> : null}
                </div>
              </Reveal>
            );
          })}
        </div>
        <ul className="mt-8 flex flex-col items-center justify-center gap-x-8 gap-y-2 text-sm font-medium sm:flex-row">
          {[
            { href: PRIVACY_ROUTE, label: content.links.privacy },
            { href: TERMS_ROUTE, label: content.links.terms },
          ].map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="inline-flex min-h-11 items-center gap-1.5 underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground">
                {link.label}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
