"use client";

import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { ROUTES, PRIVACY_ROUTE } from "@/lib/constants";
import { FormFieldError } from "@/components/shared";
import { GoogleButton } from "@/components/modules/identity/google-button";
import { loginAction } from "@/components/modules/identity/identity.service";
import {
  loginSchema,
  type LoginInput,
} from "@/components/modules/identity/schema";

/**
 * Sign-in form styled after the shadcn login-03 template: centered card, social
 * provider, "or continue with" separator, credentials, and the terms note below.
 */
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
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              {formError ? (
                <Alert variant="destructive">
                  <AlertTitle>{t("failed")}</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}
              <Field>
                <GoogleButton next={next} />
              </Field>
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
                        className="ml-auto text-sm underline-offset-4 hover:underline"
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
                <FieldDescription className="text-center">
                  {t("noAccount")} <Link href={ROUTES.REGISTER}>{t("signUp")}</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        {t.rich("terms", { privacy: (chunks) => <Link href={PRIVACY_ROUTE}>{chunks}</Link> })}
      </FieldDescription>
    </div>
  );
}
