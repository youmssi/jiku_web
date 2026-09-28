"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, HelpCircle, Minus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormFieldError } from "@/components/shared";
import { CARD_STYLE_TOKENS, type CardStyle } from "@/lib/card-style";
import { ticketRoute } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { respondAction } from "./open-invitation.service";
import { OPEN_ANSWERS, respondSchema, type OpenAnswer, type OpenResponse, type PublicOpenInvitation, type RespondInput } from "./schema";

const ICONS: Record<OpenAnswer, typeof Check> = { YES: Check, MAYBE: HelpCircle, NO: X };

/**
 * The answer to a shared card (JIKU-184, JIKU-194), in two short steps: first
 * the answer and who comes along, then the name and the number. Answering again
 * from the same number changes the answer; a yes leads to the ticket.
 */
export function RespondForm({ invitation, style }: { invitation: PublicOpenInvitation; style: CardStyle }) {
  const t = useTranslations("guest.openInvitation");
  const tokens = CARD_STYLE_TOKENS[style];
  const radius = Math.min(tokens.radius, 18);
  const [step, setStep] = useState<"answer" | "who">("answer");
  const [answered, setAnswered] = useState<OpenResponse | null>(null);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<RespondInput>({
    resolver: zodResolver(respondSchema),
    mode: "onTouched",
    defaultValues: { name: "", phone: "", answer: "YES", companions: 0 },
  });
  const answer = useWatch({ control, name: "answer" });
  const companions = useWatch({ control, name: "companions" });

  const primary = { background: tokens.panelInk, color: tokens.panel, borderRadius: radius };

  async function onSubmit(values: RespondInput) {
    const result = await respondAction(invitation.code, {
      ...values,
      companions: values.answer === "YES" ? values.companions : 0,
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setAnswered(result.data);
  }

  if (answered) {
    return (
      <div className="flex flex-col items-center gap-4 bg-white p-6 text-center shadow-sm" style={{ borderRadius: radius }}>
        <span className="flex size-12 items-center justify-center rounded-full motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-300" style={{ background: tokens.soft }}>
          <Check aria-hidden className="size-6" />
        </span>
        <p className="text-balance text-lg font-semibold">{t(`answered.${answered.answer}`, { count: answered.companions })}</p>
        {answered.ticketToken ? (
          <Link href={ticketRoute(answered.ticketToken)} className="flex h-12 w-full items-center justify-center text-[15px] font-semibold" style={primary}>
            {t("seeTicket")}
          </Link>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setAnswered(null);
            setStep("answer");
          }}
          className="text-sm font-medium underline underline-offset-4"
        >
          {t("changeAnswer")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {step === "answer" ? (
        <>
          <Controller
            control={control}
            name="answer"
            render={({ field }) => (
              <fieldset className="flex flex-col gap-3">
                <legend className="mb-3 text-sm font-semibold">{t("question")}</legend>
                <div role="radiogroup" aria-label={t("question")} className="grid grid-cols-3 gap-2">
                  {OPEN_ANSWERS.map((option) => {
                    const Icon = ICONS[option];
                    const selected = field.value === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => field.onChange(option)}
                        className={cn(
                          "flex flex-col items-center gap-2 border-[1.5px] px-2 py-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                          selected ? "border-transparent" : "bg-white",
                        )}
                        style={{
                          borderRadius: radius,
                          borderColor: selected ? tokens.panelInk : `color-mix(in srgb, ${tokens.panelInk} 14%, transparent)`,
                          background: selected ? tokens.panelInk : undefined,
                          color: selected ? tokens.panel : tokens.panelInk,
                        }}
                      >
                        <span
                          className="flex size-8 items-center justify-center rounded-full"
                          style={{ background: selected ? "rgba(255,255,255,0.18)" : tokens.soft }}
                        >
                          <Icon aria-hidden className="size-4" />
                        </span>
                        {t(`answers.${option}`)}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}
          />

          {answer === "YES" && invitation.maxCompanions > 0 ? (
            <div className="flex items-center justify-between bg-white px-4 py-3 text-sm font-semibold" style={{ borderRadius: radius }}>
              <span id="companions-label">{t("companions")}</span>
              <div className="flex items-center gap-3" role="group" aria-labelledby="companions-label">
                <button
                  type="button"
                  aria-label={t("fewer")}
                  disabled={companions === 0}
                  onClick={() => setValue("companions", Math.max(0, companions - 1))}
                  className="flex size-9 items-center justify-center rounded-full border-[1.5px] disabled:opacity-40"
                  style={{ borderColor: `color-mix(in srgb, ${tokens.panelInk} 20%, transparent)` }}
                >
                  <Minus aria-hidden className="size-4" />
                </button>
                <span className="w-5 text-center tabular-nums" aria-live="polite">
                  {companions}
                </span>
                <button
                  type="button"
                  aria-label={t("more")}
                  disabled={companions >= invitation.maxCompanions}
                  onClick={() => setValue("companions", Math.min(invitation.maxCompanions, companions + 1))}
                  className="flex size-9 items-center justify-center rounded-full border-[1.5px] disabled:opacity-40"
                  style={{ borderColor: `color-mix(in srgb, ${tokens.panelInk} 20%, transparent)` }}
                >
                  <Plus aria-hidden className="size-4" />
                </button>
              </div>
            </div>
          ) : null}

          <div className="sticky bottom-0 -mx-5 px-5 pb-5 pt-3" style={{ background: `linear-gradient(transparent, ${tokens.panel} 35%)` }}>
            <button type="button" onClick={() => setStep("who")} className="flex h-12 w-full items-center justify-center text-[15px] font-semibold" style={primary}>
              {t("continue")}
            </button>
          </div>
        </>
      ) : (
        <>
          <button type="button" onClick={() => setStep("answer")} className="flex items-center gap-1.5 self-start text-sm font-medium">
            <ArrowLeft aria-hidden className="size-4" />
            {t(`answers.${answer}`)}
            {answer === "YES" && companions > 0 ? ` + ${companions}` : null}
          </button>
          <FieldGroup>
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="open-name">{t("name")}</FieldLabel>
                  <Input {...field} id="open-name" autoComplete="name" autoFocus aria-invalid={fieldState.invalid} className="h-12 bg-white" />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="open-phone">{t("phone")}</FieldLabel>
                  <Input
                    {...field}
                    id="open-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+224 620 00 00 00"
                    aria-invalid={fieldState.invalid}
                    className="h-12 bg-white"
                  />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
          </FieldGroup>
          <div className="sticky bottom-0 -mx-5 flex flex-col gap-2 px-5 pb-5 pt-3" style={{ background: `linear-gradient(transparent, ${tokens.panel} 35%)` }}>
            <button type="submit" disabled={isSubmitting} className="flex h-12 w-full items-center justify-center text-[15px] font-semibold disabled:opacity-60" style={primary}>
              {t("submit")}
            </button>
            <p className="text-center text-xs" style={{ color: tokens.panelMuted }}>
              {t("privacy")}
            </p>
          </div>
        </>
      )}
    </form>
  );
}
