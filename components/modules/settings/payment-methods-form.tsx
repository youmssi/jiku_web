"use client";

import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormFieldError } from "@/components/shared";
import { updatePaymentMethodsAction } from "./settings.service";
import { paymentMethodsSchema, type PaymentMethodsInfo, type PaymentMethodsInput } from "./schema";

const NUMBER_FIELDS = ["orangeMoneyNumber", "mtnMomoNumber", "waveNumber"] as const;
const NUMBER_LABELS = { orangeMoneyNumber: "orangeMoney", mtnMomoNumber: "mtnMomo", waveNumber: "wave" } as const;

/**
 * How the organization's clients pay it (JIKU-109): the payee named on the
 * Mobile Money confirmation, the numbers to send to and an optional payment
 * link. Clients see them wherever a ticket is due; Jikū never holds the money.
 */
export function PaymentMethodsForm({ initial }: { initial: PaymentMethodsInfo | null }) {
  const t = useTranslations("settings.paymentMethods");
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<PaymentMethodsInput>({
    resolver: zodResolver(paymentMethodsSchema),
    mode: "onTouched",
    defaultValues: {
      payeeName: initial?.payeeName ?? "",
      orangeMoneyNumber: initial?.orangeMoneyNumber ?? "",
      mtnMomoNumber: initial?.mtnMomoNumber ?? "",
      waveNumber: initial?.waveNumber ?? "",
      paymentLinkUrl: initial?.paymentLinkUrl ?? "",
    },
  });

  async function onSubmit(values: PaymentMethodsInput) {
    const result = await updatePaymentMethodsAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    reset({
      payeeName: result.data.payeeName ?? "",
      orangeMoneyNumber: result.data.orangeMoneyNumber ?? "",
      mtnMomoNumber: result.data.mtnMomoNumber ?? "",
      waveNumber: result.data.waveNumber ?? "",
      paymentLinkUrl: result.data.paymentLinkUrl ?? "",
    });
    toast.success(t("saved"));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-xl">
      <FieldGroup>
        <div>
          <h3 className="text-base font-semibold">{t("title")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("text")}</p>
        </div>
        <Controller
          control={control}
          name="payeeName"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="pm-payeeName">{t("payeeName")}</FieldLabel>
              <Input {...field} id="pm-payeeName" autoComplete="organization" aria-invalid={fieldState.invalid} />
              <FieldDescription>{t("payeeNameHelp")}</FieldDescription>
              <FormFieldError error={fieldState.error} />
            </Field>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {NUMBER_FIELDS.map((name) => (
            <Controller
              key={name}
              control={control}
              name={name}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`pm-${name}`}>{t(NUMBER_LABELS[name])}</FieldLabel>
                  <Input
                    {...field}
                    id={`pm-${name}`}
                    type="tel"
                    inputMode="tel"
                    placeholder="+224 6XX XX XX XX"
                    aria-invalid={fieldState.invalid}
                  />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
          ))}
        </div>
        <Controller
          control={control}
          name="paymentLinkUrl"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="pm-paymentLinkUrl">{t("paymentLink")}</FieldLabel>
              <Input {...field} id="pm-paymentLinkUrl" type="url" placeholder="https://" aria-invalid={fieldState.invalid} />
              <FieldDescription>{t("paymentLinkHelp")}</FieldDescription>
              <FormFieldError error={fieldState.error} />
            </Field>
          )}
        />
        <Field orientation="horizontal">
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? t("saving") : t("save")}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
