"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthCard } from "@/components/modules/identity/auth-card";
import { createOrgAction, logoutAction } from "@/components/modules/identity/identity.service";
import { createOrgSchema, type CreateOrgInput } from "@/components/modules/identity/schema";
import { FormFieldError } from "@/components/shared";
import { ROUTES } from "@/lib/constants";

/**
 * Names an organization for an account that has none: a Google sign-up, or
 * the account menu's "New organization" entry. Email sign-ups name theirs on
 * the registration form and never see this screen (JIKU-253).
 *
 * `canCancel` is true when the account already runs at least one organization
 * (reached via the account menu's "New organization" entry) — those visitors
 * need a way back to where they were instead of being stranded here.
 */
export function OnboardingForm({ email, canCancel }: { email: string; canCancel: boolean }) {
  const t = useTranslations("auth.onboarding");
  const tCommon = useTranslations("common.actions");
  const tRegister = useTranslations("auth.register");
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CreateOrgInput>({
    resolver: zodResolver(createOrgSchema),
    mode: "onTouched",
    defaultValues: { name: "" },
  });

  async function onSubmit(values: CreateOrgInput) {
    setFormError(null);
    const result = await createOrgAction(values);
    if (result && !result.ok) {
      setFormError(result.error);
    }
  }

  return (
    <AuthCard title={t("title")} description={t("description", { email })}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          {formError ? (
            <Alert variant="destructive">
              <AlertTitle>{t("failedTitle")}</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{t("name")}</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  autoComplete="organization"
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>{tRegister("organizationNameHint")}</FieldDescription>
                <FormFieldError error={fieldState.error} />
              </Field>
            )}
          />
          <Field>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t("submitting") : t("submit")}
            </Button>
            {canCancel ? (
              <Button asChild variant="outline" className="w-full">
                <Link href={ROUTES.DASHBOARD}>{tCommon("cancel")}</Link>
              </Button>
            ) : null}
            <FieldDescription className="text-center">
              {t("wrongAccount")}{" "}
              <button type="button" className="underline underline-offset-4" onClick={() => void logoutAction()}>
                {tCommon("signOut")}
              </button>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
