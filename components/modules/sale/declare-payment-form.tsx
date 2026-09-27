"use client";

import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormFieldError } from "@/components/shared";
import { declarePaymentAction } from "./sale.service";
import { declareSchema, type DeclareInput } from "./schema";

/** "I paid": the transaction reference the organization will look for in its account. */
export function DeclarePaymentForm({ token }: { token: string }) {
  const t = useTranslations("guest.order");
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<DeclareInput>({ resolver: zodResolver(declareSchema), defaultValues: { paymentReference: "" } });

  async function onSubmit(values: DeclareInput) {
    const result = await declarePaymentAction(token, values);
    if (!result.ok) {
      toast.error(result.error);
      router.refresh();
      return;
    }
    toast.success(t("declared"));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
      <Controller
        control={control}
        name="paymentReference"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="payment-reference">{t("reference")}</FieldLabel>
            <Input {...field} id="payment-reference" autoComplete="off" aria-invalid={fieldState.invalid} />
            <FieldDescription>{t("referenceHelp")}</FieldDescription>
            <FormFieldError error={fieldState.error} />
          </Field>
        )}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("declaring") : t("declare")}
      </Button>
    </form>
  );
}
