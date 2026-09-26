"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { FormFieldError } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { adminLoginAction } from "./admin.service";
import {
  adminLoginSchema,
  type AdminLoginFormValues,
} from "./schema";

/**
 * Back-office sign-in: email and password only. No third-party providers are
 * enabled for this surface, so no social button is rendered at all rather than
 * a dead one an operator could click.
 */
export function AdminLoginForm() {
  const t = useTranslations("admin.login");
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: AdminLoginFormValues) {
    setFormError(null);
    const result = await adminLoginAction(values.email, values.password);
    // A successful login redirects; only a failure returns.
    if (!result.ok) {
      setFormError(result.error);
      toast.error(result.error);
    }
  }

  return (
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
                aria-invalid={fieldState.invalid}
                autoComplete="username"
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
                aria-invalid={fieldState.invalid}
                autoComplete="current-password"
              />
              <FormFieldError error={fieldState.error} />
            </Field>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </FieldGroup>
    </form>
  );
}
