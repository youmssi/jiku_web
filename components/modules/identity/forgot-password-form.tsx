"use client";

import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormFieldError } from "@/components/shared";
import { ROUTES } from "@/lib/constants";
import { AuthCard } from "@/components/modules/identity/auth-card";
import { forgotPasswordAction } from "@/components/modules/identity/identity.service";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/components/modules/identity/schema";

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgot");
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setFormError(null);
    const result = await forgotPasswordAction(values);
    if (result.ok) {
      setSent(true);
    } else {
      setFormError(result.error);
    }
  }

  const backToSignIn = (
    <FieldDescription className="text-center">
      {t("remembered")} <Link href={ROUTES.LOGIN}>{t("signIn")}</Link>
    </FieldDescription>
  );

  return (
    <AuthCard title={t("title")} description={t("description")}>
      {sent ? (
        <FieldGroup>
          <Alert>
            <AlertTitle>{t("sentTitle")}</AlertTitle>
            <AlertDescription>{t("sentDescription")}</AlertDescription>
          </Alert>
          {backToSignIn}
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
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("email")}</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                  />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
            <Field>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? t("submitting") : t("submit")}
              </Button>
              {backToSignIn}
            </Field>
          </FieldGroup>
        </form>
      )}
    </AuthCard>
  );
}
