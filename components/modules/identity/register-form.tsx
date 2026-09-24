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
  CardFooter,
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
import { ROUTES } from "@/lib/constants";
import { FormFieldError } from "@/components/shared";
import { GoogleButton } from "@/components/modules/identity/google-button";
import { registerAction } from "@/components/modules/identity/identity.service";
import {
  registerSchema,
  type RegisterInput,
} from "@/components/modules/identity/schema";

export function RegisterForm({ next }: { next?: string }) {
  const t = useTranslations("auth.register");
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: { fullName: "", email: "", password: "" },
  });

  async function onSubmit(values: RegisterInput) {
    setFormError(null);
    const result = await registerAction(values, next);
    if (!result.ok) {
      setFormError(result.error);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-(--card-spacing)">
          <CardContent>
            <FieldGroup>
              {formError ? (
                <Alert variant="destructive">
                  <AlertTitle>{t("failed")}</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}
              <Controller
                control={control}
                name="fullName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{t("fullName")}</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="text"
                      autoComplete="name"
                      aria-invalid={fieldState.invalid}
                    />
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
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t("submitting") : t("submit")}
            </Button>
            <GoogleButton next={next} />
            <FieldDescription className="text-center">
              {t("haveAccount")} <Link href={ROUTES.LOGIN}>{t("signIn")}</Link>
            </FieldDescription>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
