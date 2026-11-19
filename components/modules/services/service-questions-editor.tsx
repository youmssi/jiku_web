"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { List, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { saveServiceQuestionsAction } from "./services.service";
import {
  QUESTION_LIMITS,
  serviceQuestionsSchema,
  type ServiceQuestion,
  type ServiceQuestionsInput,
  type ServiceSummary,
} from "./schema";

type Draft = ServiceQuestionsInput["questions"];

function toDraft(questions: ServiceQuestion[]): Draft {
  return questions.map((question) => ({
    prompt: question.prompt ?? "",
    choices: (question.choices ?? []).map((choice) => ({ label: choice.label ?? "", routeServiceId: choice.routeServiceId ?? null })),
  }));
}

function emptyQuestion(): Draft[number] {
  return { prompt: "", choices: [{ label: "", routeServiceId: null }, { label: "", routeServiceId: null }] };
}

/**
 * A service's guided questions (JIKU-191): up to three choice questions asked
 * before the times, each with two to ten answers of 20 characters, WhatsApp's
 * limits, checked as the organizer types. An answer can lead to another of the
 * organization's services. The preview shows the questions as WhatsApp will:
 * buttons up to three answers, a list beyond. `"use client"`: the draft is edited
 * in the page and saved at once.
 */
export function ServiceQuestionsEditor({
  serviceId,
  initial,
  otherServices,
}: {
  serviceId: string;
  initial: ServiceQuestion[];
  otherServices: Pick<ServiceSummary, "id" | "name">[];
}) {
  const t = useTranslations("services.questions");
  const [draft, setDraft] = useState<Draft>(() => toDraft(initial));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, startSaving] = useTransition();

  function update(change: (current: Draft) => Draft) {
    setDraft((current) => change(structuredClone(current)));
    setErrors({});
  }

  function save() {
    const parsed = serviceQuestionsSchema.safeParse({ questions: draft });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join("."), issue.message])));
      return;
    }
    startSaving(async () => {
      const result = await saveServiceQuestionsAction(serviceId, parsed.data);
      if (!result.ok) return void toast.error(result.error);
      setDraft(toDraft(result.data));
      toast.success(t("saved"));
    });
  }

  const error = (path: string) => (errors[path] ? t(`errors.${errors[path]}` as "errors.invalid") : null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
        <div className="flex flex-col gap-5">
          {draft.length === 0 ? <p className="text-sm text-muted-foreground">{t("empty")}</p> : null}
          {draft.map((question, index) => (
            <fieldset key={index} className="flex flex-col gap-3 rounded-lg border p-3">
              <div className="flex items-start gap-2">
                <Field className="flex-1">
                  <FieldLabel htmlFor={`question-${index}`}>
                    {t("prompt")} {index + 1}
                  </FieldLabel>
                  <Input
                    id={`question-${index}`}
                    value={question.prompt}
                    maxLength={QUESTION_LIMITS.prompt}
                    placeholder={t("promptPlaceholder")}
                    aria-invalid={error(`questions.${index}.prompt`) !== null}
                    onChange={(event) =>
                      update((current) => {
                        current[index].prompt = event.target.value;
                        return current;
                      })
                    }
                  />
                  {error(`questions.${index}.prompt`) ? <FieldError>{error(`questions.${index}.prompt`)}</FieldError> : null}
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-6"
                  aria-label={t("remove")}
                  onClick={() => update((current) => current.filter((_, i) => i !== index))}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">{t("choices")}</p>
                {question.choices.map((choice, position) => {
                  const path = `questions.${index}.choices.${position}.label`;
                  return (
                    <div key={position} className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Input
                          className="min-w-0 flex-1"
                          value={choice.label}
                          maxLength={QUESTION_LIMITS.label}
                          placeholder={t("choicePlaceholder", { n: position + 1 })}
                          aria-label={t("choicePlaceholder", { n: position + 1 })}
                          aria-invalid={error(path) !== null}
                          onChange={(event) =>
                            update((current) => {
                              current[index].choices[position].label = event.target.value;
                              return current;
                            })
                          }
                        />
                        {otherServices.length > 0 ? (
                          <NativeSelect
                            aria-label={t("route")}
                            value={choice.routeServiceId ?? ""}
                            onChange={(event) =>
                              update((current) => {
                                current[index].choices[position].routeServiceId = event.target.value || null;
                                return current;
                              })
                            }
                          >
                            <NativeSelectOption value="">{t("routeNone")}</NativeSelectOption>
                            {otherServices.map((service) => (
                              <NativeSelectOption key={service.id} value={service.id}>
                                {service.name}
                              </NativeSelectOption>
                            ))}
                          </NativeSelect>
                        ) : null}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={t("removeChoice")}
                          disabled={question.choices.length <= QUESTION_LIMITS.minChoices}
                          onClick={() =>
                            update((current) => {
                              current[index].choices.splice(position, 1);
                              return current;
                            })
                          }
                        >
                          <X className="size-4" aria-hidden />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {error(path) ?? t("limits", { count: QUESTION_LIMITS.label - choice.label.trim().length })}
                      </p>
                    </div>
                  );
                })}
                {error(`questions.${index}.choices`) ? <FieldError>{error(`questions.${index}.choices`)}</FieldError> : null}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={question.choices.length >= QUESTION_LIMITS.maxChoices}
                    onClick={() =>
                      update((current) => {
                        current[index].choices.push({ label: "", routeServiceId: null });
                        return current;
                      })
                    }
                  >
                    <Plus className="size-4" aria-hidden />
                    {t("addChoice")}
                  </Button>
                  <FieldDescription>
                    {question.choices.length <= QUESTION_LIMITS.buttons ? t("asButtons") : t("asList")}
                  </FieldDescription>
                </div>
              </div>
            </fieldset>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={draft.length >= QUESTION_LIMITS.questions}
              onClick={() => update((current) => [...current, emptyQuestion()])}
            >
              <Plus className="size-4" aria-hidden />
              {t("add")}
            </Button>
            <Button type="button" onClick={save} disabled={saving}>
              {saving ? <Spinner /> : null}
              {t("save")}
            </Button>
          </div>
        </div>
        <QuestionsPreview draft={draft} />
      </CardContent>
    </Card>
  );
}

/** The questions as WhatsApp shows them: a message, then buttons up to three answers or a list beyond. */
function QuestionsPreview({ draft }: { draft: Draft }) {
  const t = useTranslations("services.questions");
  return (
    <section aria-label={t("preview")} className="flex flex-col gap-2 rounded-xl bg-[#efeae2] p-3 text-[#111b21]">
      <p className="text-xs font-medium text-[#54656f]">{t("preview")}</p>
      {draft.length === 0 ? <p className="text-sm text-[#54656f]">{t("previewEmpty")}</p> : null}
      {draft.map((question, index) => (
        <div key={index} className="flex max-w-full flex-col gap-1 self-start">
          <p className="rounded-lg rounded-tl-none bg-white px-3 py-2 text-sm shadow-sm">
            {question.prompt.trim() || t("promptPlaceholder")}
          </p>
          {question.choices.length <= QUESTION_LIMITS.buttons ? (
            question.choices.map((choice, position) => (
              <span key={position} className="rounded-lg bg-white px-3 py-1.5 text-center text-sm font-medium text-[#008069] shadow-sm">
                {choice.label.trim() || t("choicePlaceholder", { n: position + 1 })}
              </span>
            ))
          ) : (
            <span className="flex items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-[#008069] shadow-sm">
              <List className="size-4" aria-hidden />
              {t("previewList")}
            </span>
          )}
        </div>
      ))}
    </section>
  );
}
