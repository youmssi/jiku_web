"use client";

import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { FormFieldError } from "@/components/shared";
import { ROUTES } from "@/lib/constants";
import { AuthCard } from "@/components/modules/identity/auth-card";
import { resetPasswordAction } from "@/components/modules/identity/identity.service";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/components/modules/identity/schema";

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("auth.reset");
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: { password: "" },
  });

  async function onSubmit(values: ResetPasswordInput) {
    setFormError(null);
    const result = await resetPasswordAction(token, values);
    if (result.ok) {
      setDone(true);
    } else {
      setFormError(result.error);
    }
  }

  return (
    <AuthCard title={t("title")} description={t("description")}>
      {done ? (
        <FieldGroup>
          <Alert>
            <AlertTitle>{t("doneTitle")}</AlertTitle>
            <AlertDescription>{t("doneDescription")}</AlertDescription>
          </Alert>
          <Button asChild className="w-full">
            <Link href={ROUTES.LOGIN}>{t("goToSignIn")}</Link>
          </Button>
        </FieldGroup>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            {formError ? (
              <Alert variant="destructive">
                <AlertTitle>{t("failed")}</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}
            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("password")}</FieldLabel>
                  <PasswordInput
                    {...field}
                    id={field.name}
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>{t("passwordHint")}</FieldDescription>
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
            <Field>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? t("submitting") : t("submit")}
              </Button>
              <FieldDescription className="text-center">
                {t("expired")} <Link href={ROUTES.FORGOT_PASSWORD}>{t("requestNew")}</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      )}
    </AuthCard>
  );
}
