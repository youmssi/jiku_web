import { ArrowRight, CalendarDays, Clock3, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { RotatingText } from "@/components/effects";
import { TrackedLink } from "@/components/shared";
import { ROUTES } from "@/lib/constants";
import type { LandingContent } from "./content";

/**
 * The promise, both uses of the product and the one action that matters. Server
 * rendered for a fast first paint; only the rotating word ships JavaScript.
 */
export function HeroSection({ content }: { content: LandingContent["hero"] }) {
  return (
    <section className="relative overflow-hidden pt-28 sm:pt-36">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[10%] -top-[25%] size-[50vw] max-h-[640px] max-w-[640px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-[10%] top-[30%] size-[40vw] max-h-[520px] max-w-[520px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-20 text-center sm:pb-28">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
          <JikūLogo variant="mark" className="size-3.5" />
          {content.badge}
        </div>

        <h1 className="mx-auto max-w-5xl text-balance text-[clamp(2.4rem,7vw,5rem)] font-bold leading-[1.02] tracking-tight">
          {content.headlinePrefix}{" "}
          <RotatingText texts={content.headlineWords} className="text-primary" />
          <br />
          {content.headlineSuffix}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">{content.subtitle}</p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 rounded-full px-8 text-base shadow-lg shadow-primary/25">
            <TrackedLink
              href={ROUTES.REGISTER}
              eventName="cta_click"
              eventProperties={{ location: "hero", label: content.primaryCta }}
            >
              {content.primaryCta}
              <ArrowRight className="ml-2 size-4" />
            </TrackedLink>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-8 text-base">
            <a href="#how-it-works">{content.secondaryCta}</a>
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{content.ctaNote}</p>

        <div className="mx-auto mt-16 grid max-w-4xl gap-4 text-left sm:grid-cols-2">
          <a href="#events" className="group rounded-2xl border border-border/50 bg-card/80 p-5 backdrop-blur transition hover:border-primary/40">
            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
              <CalendarDays className="size-4 text-primary" />
              {content.uses.events}
            </div>
            <EventTicketPreview />
          </a>
          <a href="#services" className="group rounded-2xl border border-border/50 bg-card/80 p-5 backdrop-blur transition hover:border-primary/40">
            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
              <Clock3 className="size-4 text-primary" />
              {content.uses.services}
            </div>
            <DayLinePreview />
          </a>
        </div>
      </div>
    </section>
  );
}

/** A stylized ticket: what a guest holds at the door. Decorative, hidden from assistive technology. */
function EventTicketPreview() {
  return (
    <div aria-hidden className="mt-4 flex items-center gap-4 rounded-xl border border-dashed border-border/70 p-4">
      <QrCode className="size-14 shrink-0 text-foreground/80" />
      <div className="flex-1 space-y-2">
        <div className="h-2.5 w-3/4 rounded-full bg-foreground/20" />
        <div className="h-2 w-1/2 rounded-full bg-foreground/10" />
        <div className="inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-700 dark:text-emerald-300">
          VIP
        </div>
      </div>
    </div>
  );
}

/** A stylized day line: who is being served, who is next. Decorative. */
function DayLinePreview() {
  return (
    <div aria-hidden className="mt-4 space-y-2">
      {["A-12", "A-13", "A-14"].map((code, index) => (
        <div
          key={code}
          className={
            index === 0
              ? "flex items-center justify-between rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
              : "flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-xs text-muted-foreground"
          }
        >
          <span>{code}</span>
          <span className="h-1.5 w-16 rounded-full bg-current opacity-30" />
        </div>
      ))}
    </div>
  );
}
