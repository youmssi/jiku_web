"use client";

import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { ROUTES } from "@/lib/constants";
import { FormFieldError } from "@/components/shared";
import { AuthCard } from "@/components/modules/identity/auth-card";
import { AuthTerms } from "@/components/modules/identity/auth-terms";
import { GoogleButton } from "@/components/modules/identity/google-button";
import { loginAction } from "@/components/modules/identity/identity.service";
import {
  loginSchema,
  type LoginInput,
} from "@/components/modules/identity/schema";

/** Sign-in: credentials first, Google below the "or" separator, terms underneath. */
export function LoginForm({ next }: { next?: string }) {
  const t = useTranslations("auth.login");
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    const result = await loginAction(values, next);
    if (!result.ok) {
      setFormError(result.error);
    }
  }

  return (
    <>
      <AuthCard title={t("title")} description={t("description")}>
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
              <Controller
                control={control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="flex items-center">
                      <FieldLabel htmlFor={field.name}>{t("password")}</FieldLabel>
                      <Link
                        href={ROUTES.FORGOT_PASSWORD}
                        className="ml-auto text-xs underline-offset-4 hover:underline"
                      >
                        {t("forgot")}
                      </Link>
                    </div>
                    <PasswordInput
                      {...field}
                      id={field.name}
                      autoComplete="current-password"
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
                <GoogleButton next={next} />
                <FieldDescription className="text-center">
                  {t("noAccount")} <Link href={ROUTES.REGISTER}>{t("signUp")}</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
      </AuthCard>
      <AuthTerms />
    </>
  );
}
