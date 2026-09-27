"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateOrderHoldAction } from "./sale.service";
import { holdSchema, type HoldInput, type SalesSettings } from "./schema";

/**
 * How long an unpaid ticket order keeps its places (JIKU-177). Short when the
 * organizer answers fast and the event sells out; longer when it checks its
 * Mobile Money account once or twice a day.
 */
export function SalesSettingsForm({ initial }: { initial: SalesSettings | null }) {
  const t = useTranslations("settings.sales");
  const schema = useMemo(
    () => holdSchema(initial?.minOrderHoldMinutes ?? 0, initial?.maxOrderHoldMinutes ?? Number.MAX_SAFE_INTEGER),
    [initial],
  );
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<HoldInput>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { minutes: initial?.effectiveOrderHoldMinutes ?? 30 },
  });

  if (!initial) return <p className="text-sm text-muted-foreground">{t("loadFailed")}</p>;

  async function save(minutes: number | null) {
    const result = await updateOrderHoldAction(minutes);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    reset({ minutes: result.data.effectiveOrderHoldMinutes });
    toast.success(t("saved"));
  }

  return (
    <form onSubmit={handleSubmit((values) => save(values.minutes))} noValidate className="max-w-xl">
      <FieldGroup>
        <div>
          <h3 className="text-base font-semibold">{t("title")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("text")}</p>
        </div>
        <Controller
          control={control}
          name="minutes"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="order-hold">{t("hold")}</FieldLabel>
              <Input
                id="order-hold"
                type="number"
                inputMode="numeric"
                min={initial.minOrderHoldMinutes}
                max={initial.maxOrderHoldMinutes}
                className="w-40"
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={Number.isNaN(field.value) ? "" : field.value}
                onChange={(event) => field.onChange(event.target.valueAsNumber)}
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                {t("holdHelp", {
                  min: initial.minOrderHoldMinutes,
                  max: initial.maxOrderHoldMinutes,
                  default: initial.defaultOrderHoldMinutes,
                })}
              </FieldDescription>
              {fieldState.error ? (
                <p className="text-sm text-destructive">
                  {t(fieldState.error.message === "outOfRange" ? "outOfRange" : "wholeNumber", {
                    min: initial.minOrderHoldMinutes,
                    max: initial.maxOrderHoldMinutes,
                  })}
                </p>
              ) : null}
            </Field>
          )}
        />
        <Field orientation="horizontal">
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? t("saving") : t("save")}
          </Button>
          {initial.orderHoldMinutes !== null ? (
            <Button type="button" variant="ghost" disabled={isSubmitting} onClick={() => save(null)}>
              {t("useDefault", { minutes: initial.defaultOrderHoldMinutes })}
            </Button>
          ) : null}
        </Field>
      </FieldGroup>
    </form>
  );
}
