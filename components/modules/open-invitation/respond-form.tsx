"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FormFieldError } from "@/components/shared";
import { ticketRoute } from "@/lib/constants";
import { respondAction } from "./open-invitation.service";
import { OPEN_ANSWERS, respondSchema, type OpenResponse, type PublicOpenInvitation, type RespondInput } from "./schema";

/**
 * The answer to a shared card (JIKU-184): yes, maybe or no, with a name and a
 * number, and who comes along on a yes. Answering again from the same number
 * changes the answer; a yes leads to the ticket.
 */
export function RespondForm({ invitation }: { invitation: PublicOpenInvitation }) {
  const t = useTranslations("guest.openInvitation");
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
      <div className="flex flex-col items-center gap-4 rounded-xl border p-6 text-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check aria-hidden className="size-5" />
        </span>
        <p className="font-medium">{t(`answered.${answered.answer}`, { count: answered.companions })}</p>
        {answered.ticketToken ? (
          <Button asChild>
            <Link href={ticketRoute(answered.ticketToken)}>{t("seeTicket")}</Link>
          </Button>
        ) : null}
        <Button type="button" variant="ghost" size="sm" onClick={() => setAnswered(null)}>
          {t("changeAnswer")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <Controller
          control={control}
          name="answer"
          render={({ field }) => (
            <FieldSet>
              <FieldLegend variant="label">{t("question")}</FieldLegend>
              <ToggleGroup
                type="single"
                variant="outline"
                value={field.value}
                onValueChange={(value) => value && field.onChange(value)}
                className="w-full"
              >
                {OPEN_ANSWERS.map((option) => (
                  <ToggleGroupItem key={option} value={option} className="flex-1">
                    {t(`answers.${option}`)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FieldSet>
          )}
        />

        {answer === "YES" && invitation.maxCompanions > 0 ? (
          <Field>
            <FieldLabel>{t("companions")}</FieldLabel>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label={t("fewer")}
                disabled={companions === 0}
                onClick={() => setValue("companions", Math.max(0, companions - 1))}
              >
                <Minus aria-hidden />
              </Button>
              <span className="w-6 text-center font-medium tabular-nums" aria-live="polite">
                {companions}
              </span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label={t("more")}
                disabled={companions >= invitation.maxCompanions}
                onClick={() => setValue("companions", Math.min(invitation.maxCompanions, companions + 1))}
              >
                <Plus aria-hidden />
              </Button>
            </div>
            <FieldDescription>{t("companionsHelp", { max: invitation.maxCompanions })}</FieldDescription>
          </Field>
        ) : null}

        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="open-name">{t("name")}</FieldLabel>
              <Input {...field} id="open-name" autoComplete="name" aria-invalid={fieldState.invalid} />
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
              />
              <FieldDescription>{t("phoneHelp")}</FieldDescription>
              <FormFieldError error={fieldState.error} />
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit" disabled={isSubmitting}>
        {t("submit")}
      </Button>
      <p className="text-center text-xs text-muted-foreground">{t("privacy")}</p>
    </form>
  );
}
