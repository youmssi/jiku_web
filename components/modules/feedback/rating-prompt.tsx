"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { onRatingMoment } from "./ask-rating";
import { sendRatingAction, shouldAskRatingAction } from "./feedback.service";
import type { RatingMoment } from "./schema";

const SCORES = [1, 2, 3, 4, 5] as const;
const FACES: Record<(typeof SCORES)[number], string> = { 1: "😞", 2: "🙁", 3: "😐", 4: "🙂", 5: "🤩" };
/** Let the success toast land before asking. */
const ASK_DELAY_MS = 1_500;

/**
 * "How easy was that?" right after a key action. Mounted once in the app
 * shell; it listens for `askRating(moment)` and asks only when the backend says
 * this person has not been asked about it, nor about anything this week.
 * Closing it counts as an answer, so it never comes back for the same moment.
 */
export function RatingPrompt() {
  const t = useTranslations("feedback.rating");
  const pathname = usePathname();
  const [moment, setMoment] = useState<RatingMoment | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();
  const busy = useRef(false);

  useEffect(
    () =>
      onRatingMoment((next) => {
        if (busy.current) return;
        busy.current = true;
        window.setTimeout(async () => {
          const ask = await shouldAskRatingAction(next).catch(() => false);
          if (ask) setMoment(next);
          else busy.current = false;
        }, ASK_DELAY_MS);
      }),
    [],
  );

  function close() {
    setMoment(null);
    setScore(null);
    setComment("");
    busy.current = false;
  }

  function send(finalScore: number | null) {
    if (!moment) return;
    const current = moment;
    startTransition(async () => {
      const outcome = await sendRatingAction({ moment: current, score: finalScore, comment }, pathname);
      if (finalScore !== null) {
        if (outcome.ok) toast.success(t("thanks"));
        else toast.error(outcome.error);
      }
      close();
    });
  }

  if (!moment) return null;

  return (
    <section
      role="dialog"
      aria-labelledby="rating-prompt-title"
      className="fixed inset-x-4 bottom-20 z-50 mx-auto max-w-sm rounded-2xl border bg-popover p-5 text-popover-foreground shadow-2xl sm:right-6 sm:bottom-20 sm:left-auto sm:mx-0 motion-safe:animate-in motion-safe:slide-in-from-bottom-4 motion-safe:fade-in"
    >
      <div className="flex items-start justify-between gap-3">
        <p id="rating-prompt-title" className="font-semibold">
          {t(`questions.${moment}`)}
        </p>
        <Button variant="ghost" size="icon-sm" aria-label={t("dismiss")} disabled={pending} onClick={() => send(null)}>
          <X />
        </Button>
      </div>
      <div role="radiogroup" aria-label={t("scale")} className="mt-4 flex justify-between gap-1">
        {SCORES.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={score === value}
            aria-label={t(`scores.${value}`)}
            onClick={() => setScore(value)}
            className={cn(
              "flex size-12 items-center justify-center rounded-xl border text-2xl transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              score === value ? "scale-110 border-primary bg-primary/10" : "border-transparent hover:bg-muted",
            )}
          >
            {FACES[value]}
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{t("scores.1")}</span>
        <span>{t("scores.5")}</span>
      </div>
      {score !== null ? (
        <div className="mt-4 flex flex-col gap-3">
          <Textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={1000}
            rows={2}
            placeholder={t(score <= 3 ? "commentLow" : "commentHigh")}
            aria-label={t("comment")}
          />
          <Button disabled={pending} onClick={() => send(score)}>
            {t("send")}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
