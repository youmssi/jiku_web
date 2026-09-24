"use client";

import { useTranslations } from "next-intl";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormFieldError } from "@/components/shared";
import { saveQuorumAction } from "./event.service";
import {
  QUORUM_FRACTIONS,
  quorumFormSchema,
  type QuorumFormValues,
  type QuorumResponse,
} from "./schema";

function initialValues(quorum: QuorumResponse | null): QuorumFormValues {
  const fraction =
    QUORUM_FRACTIONS.find(
      (candidate) => candidate.numerator === quorum?.numerator && candidate.denominator === quorum?.denominator,
    )?.key ?? "half";
  const mode = quorum?.mode === "FRACTION" || quorum?.mode === "ABSOLUTE" ? quorum.mode : "NONE";
  return { mode, fraction, absolute: quorum?.absolute ?? null };
}

/**
 * The quorum rule of a general assembly (JIKU-94). A statutory rule, entered
 * once from the organization's bylaws, so it has its own card and its own save.
 * Almost no event needs one: the card opens on "no quorum" and says who it is
 * for, rather than looking like a step to fill in.
 */
export function QuorumSettings({ eventId, initial }: { eventId: string; initial: QuorumResponse | null }) {
  const t = useTranslations("events.quorum");
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<QuorumFormValues>({
    resolver: zodResolver(quorumFormSchema),
    defaultValues: initialValues(initial),
  });
  const mode = useWatch({ control, name: "mode" });

  async function onSubmit(values: QuorumFormValues) {
    const result = await saveQuorumAction(eventId, values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    reset(values);
    toast.success(values.mode === "NONE" ? t("removed") : t("saved"));
  }

  return (
    <Card id="quorum" className="scroll-mt-20">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-(--card-spacing)">
        <CardContent>
          <FieldGroup>
            {initial?.reachedAt ? (
              <Alert>
                <AlertDescription>{t("alreadyReached")}</AlertDescription>
              </Alert>
            ) : null}
            <Controller
              control={control}
              name="mode"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>{t("rule")}</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={field.name}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">{t("modes.NONE")}</SelectItem>
                      <SelectItem value="FRACTION">{t("modes.FRACTION")}</SelectItem>
                      <SelectItem value="ABSOLUTE">{t("modes.ABSOLUTE")}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            {mode === "FRACTION" ? (
              <Controller
                control={control}
                name="fraction"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>{t("share")}</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={field.name}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUORUM_FRACTIONS.map((fraction) => (
                          <SelectItem key={fraction.key} value={fraction.key}>
                            {t(`fractions.${fraction.key}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>{t("shareHint")}</FieldDescription>
                  </Field>
                )}
              />
            ) : null}
            {mode === "ABSOLUTE" ? (
              <Controller
                control={control}
                name="absolute"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{t("absolute")}</FieldLabel>
                    <Input
                      id={field.name}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={field.value ?? ""}
                      onBlur={field.onBlur}
                      onChange={(event) =>
                        field.onChange(event.target.value === "" ? null : Number(event.target.value))
                      }
                      aria-invalid={fieldState.invalid}
                      className="max-w-40"
                    />
                    <FormFieldError error={fieldState.error} />
                  </Field>
                )}
              />
            ) : null}
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? t("saving") : t("save")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
