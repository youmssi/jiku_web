"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { fill } from "./simulator-format";
import { JourneyPhone } from "./journey-screens";
import type { Journey, JourneysContent } from "./use-case-journeys";

/**
 * The journeys explorer: pick a situation, then walk its steps along a line of
 * nodes. The phone beside it shows what the person at that step sees. Steps
 * are buttons, so the whole flow works from the keyboard.
 */
export function UseCaseFlows({ content }: { content: JourneysContent }) {
  const [journeyId, setJourneyId] = useState(content.journeys[0].id);
  const [index, setIndex] = useState(0);
  const journey = content.journeys.find((candidate) => candidate.id === journeyId) ?? content.journeys[0];
  const step = journey.steps[Math.min(index, journey.steps.length - 1)];

  function selectJourney(id: string) {
    setJourneyId(id);
    setIndex(0);
  }

  return (
    <section aria-labelledby="use-case-flows" className="mt-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">{content.eyebrow}</p>
        <h2 id="use-case-flows" className="mt-3 text-balance text-2xl font-bold tracking-tight sm:text-3xl">
          {content.heading}
        </h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">{content.intro}</p>
      </div>

      <Tabs value={journeyId} onValueChange={selectJourney} className="mt-8 items-center">
        <TabsList className="h-auto flex-wrap justify-center gap-1 rounded-2xl p-1">
          {content.journeys.map((candidate) => (
            <TabsTrigger key={candidate.id} value={candidate.id} className="rounded-xl px-4 py-2 text-sm">
              {candidate.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-10 grid items-center gap-10 rounded-[2rem] border border-border/50 bg-gradient-to-br from-primary/[0.05] via-card to-card p-6 sm:p-10 lg:grid-cols-[1fr_20rem]">
        <div>
          <p className="text-sm text-muted-foreground">{journey.audience}</p>
          <StepLine journey={journey} index={index} onSelect={setIndex} />

          <div className="mt-8 rounded-2xl border border-border/50 bg-background/80 p-6" aria-live="polite">
            <p className="text-xs font-medium text-muted-foreground">
              {fill(content.stepOf, { current: index + 1, total: journey.steps.length })} · {step.actor}
            </p>
            <p className="mt-2 text-xl font-semibold tracking-tight">{step.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            <div className="mt-5 flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                aria-label={content.previous}
                disabled={index === 0}
                onClick={() => setIndex(index - 1)}
              >
                <ArrowLeft />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                aria-label={content.next}
                disabled={index === journey.steps.length - 1}
                onClick={() => setIndex(index + 1)}
              >
                <ArrowRight />
              </Button>
            </div>
          </div>
        </div>

        <JourneyPhone key={`${journey.id}-${index}`} screen={step.screen} />
      </div>
    </section>
  );
}

function StepLine({ journey, index, onSelect }: { journey: Journey; index: number; onSelect: (index: number) => void }) {
  return (
    <ol className="mt-6 flex flex-col gap-0 sm:flex-row sm:items-start">
      {journey.steps.map((step, stepIndex) => {
        const done = stepIndex < index;
        const current = stepIndex === index;
        const last = stepIndex === journey.steps.length - 1;
        return (
          <li key={step.title} className="relative flex flex-1 gap-3 sm:flex-col sm:items-center sm:gap-2">
            {!last ? (
              <span
                aria-hidden
                className={cn(
                  "absolute top-10 left-[1.1rem] h-[calc(100%-1.5rem)] w-px sm:top-[1.1rem] sm:left-[calc(50%+1.4rem)] sm:h-px sm:w-[calc(100%-2.8rem)]",
                  done ? "bg-primary" : "bg-border",
                )}
              />
            ) : null}
            <button
              type="button"
              onClick={() => onSelect(stepIndex)}
              aria-current={current ? "step" : undefined}
              className={cn(
                "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                current && "scale-110 border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25",
                done && "border-primary bg-primary/10 text-primary",
                !current && !done && "border-border bg-background text-muted-foreground hover:border-primary/50",
              )}
            >
              {stepIndex + 1}
              <span className="sr-only">{step.title}</span>
            </button>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => onSelect(stepIndex)}
              className="pb-6 text-left sm:px-1 sm:pb-0 sm:text-center"
            >
              <span className="block text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">{step.actor}</span>
              <span className={cn("block text-sm", current ? "font-semibold" : "text-muted-foreground")}>{step.title}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
