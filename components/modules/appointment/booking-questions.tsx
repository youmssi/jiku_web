"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ServiceQuestionForClient } from "@/components/modules/appointment/schema";

/**
 * The service's questions before the times (JIKU-191): one tap per answer, the
 * same questions WhatsApp asks. An answer that belongs to another service says
 * so and leads there instead of offering times here.
 */
export function BookingQuestions({
  questions,
  answers,
  onAnswer,
}: {
  questions: ServiceQuestionForClient[];
  answers: Record<string, string>;
  onAnswer: (questionId: string, choiceId: string) => void;
}) {
  const t = useTranslations("guest.appointment.booking");
  const routed = questions
    .flatMap((question) => question.choices.filter((choice) => answers[question.id] === choice.id))
    .find((choice) => choice.routeCode);

  return (
    <section className="flex flex-col gap-4" aria-label={t("questionsTitle")}>
      <h2 className="text-sm font-medium">{t("questionsTitle")}</h2>
      {questions.map((question, index) => (
        <fieldset key={question.id} className="flex flex-col gap-2">
          <legend className="mb-2 text-sm">
            <span className="block text-xs text-muted-foreground">{t("questionStep", { n: index + 1, total: questions.length })}</span>
            {question.prompt}
          </legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={question.prompt}>
            {question.choices.map((choice) => {
              const selected = answers[question.id] === choice.id;
              return (
                <button
                  key={choice.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onAnswer(question.id, choice.id)}
                  className={cn(
                    "min-h-11 rounded-xl border px-4 text-sm font-medium transition-colors",
                    selected ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/40",
                  )}
                >
                  {choice.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      {routed?.routeCode ? (
        <Alert>
          <AlertTitle>{t("routeTitle")}</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-2">
            <span>{routed.label}</span>
            <Button asChild size="sm">
              <Link href={`/r/${encodeURIComponent(routed.routeCode)}`}>{t("routeAction")}</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
    </section>
  );
}

/** True once every question has an answer that books this service. */
export function questionsAnswered(questions: ServiceQuestionForClient[], answers: Record<string, string>): boolean {
  return questions.every((question) =>
    question.choices.some((choice) => choice.id === answers[question.id] && !choice.routeCode),
  );
}
