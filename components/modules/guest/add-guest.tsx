"use client";

import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormFieldError } from "@/components/shared";
import { trackEvent } from "@/lib/analytics";
import { addGuestAction } from "@/components/modules/guest/guest.service";
import { singleGuestSchema, type SingleGuestInput } from "@/components/modules/guest/schema";

const EMPTY_GUEST: SingleGuestInput = { firstName: "", lastName: "", email: "", phone: "" };

/** One guest added by hand: a one-row import that reuses the file pipeline and its checks. */
export function AddGuest({ eventId, onAdded }: { eventId: string; onAdded?: () => void }) {
  const t = useTranslations("guests.add");
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<SingleGuestInput>({
    resolver: zodResolver(singleGuestSchema),
    mode: "onTouched",
    defaultValues: EMPTY_GUEST,
  });

  async function onSubmit(values: SingleGuestInput) {
    const outcome = await addGuestAction(eventId, values);
    if (!outcome.ok) {
      toast.error(outcome.error);
      return;
    }
    const name = `${values.firstName} ${values.lastName}`.trim();
    if (outcome.data.imported > 0) {
      trackEvent("guests_added", { source: "manual", count: 1 });
      toast.success(t("added", { name }));
      reset(EMPTY_GUEST);
      onAdded?.();
    } else if (outcome.data.skippedDuplicates > 0) {
      toast.info(t("duplicate", { name }));
    } else {
      toast.error(t("rejected"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="firstName"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{t("firstName")}</FieldLabel>
                <Input {...field} id={field.name} autoComplete="off" aria-invalid={fieldState.invalid} />
                <FormFieldError error={fieldState.error} />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{t("lastName")}</FieldLabel>
                <Input {...field} id={field.name} autoComplete="off" aria-invalid={fieldState.invalid} />
                <FormFieldError error={fieldState.error} />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{t("email")}</FieldLabel>
                <Input {...field} id={field.name} type="email" autoComplete="off" aria-invalid={fieldState.invalid} />
                <FormFieldError error={fieldState.error} />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{t("phone")}</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="tel"
                  inputMode="tel"
                  autoComplete="off"
                  placeholder="+224 620 00 00 00"
                  aria-invalid={fieldState.invalid}
                />
                <FormFieldError error={fieldState.error} />
              </Field>
            )}
          />
        </div>
        <FieldDescription>{t("contactHint")}</FieldDescription>
        <Field orientation="horizontal" className="justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("submitting") : t("submit")}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
