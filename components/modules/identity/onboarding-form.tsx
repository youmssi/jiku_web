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
import {
  createOrgAction,
  logoutAction,
  resendVerificationAction,
} from "@/components/modules/identity/identity.service";
import { createOrgSchema, type CreateOrgInput } from "@/components/modules/identity/schema";
import { FormFieldError } from "@/components/shared";
import { ROUTES } from "@/lib/constants";

/**
 * First-run onboarding (JIKU-52): the account exists, the organization doesn't.
 * A 403 from org creation means the email isn't verified yet — the resend
 * affordance lives right next to the error it fixes.
 *
 * `canCancel` is true when the account already runs at least one organization
 * (reached via the account menu's "New organization" entry) — those visitors
 * need a way back to where they were instead of being stranded here.
 */
export function OnboardingForm({ email, canCancel }: { email: string; canCancel: boolean }) {
  const t = useTranslations("auth.onboarding");
  const tCommon = useTranslations("common.actions");
  const [formError, setFormError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
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

  async function resend() {
    setResent(false);
    const result = await resendVerificationAction();
    if (result.ok) {
      setResent(true);
    } else {
      setFormError(result.error);
    }
  }

  return (
    <AuthCard title={t("title")} description={t("description", { email })}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          {formError ? (
            <Alert variant="destructive">
              <AlertTitle>{t("notYet")}</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                {formError}
                <Button type="button" variant="outline" size="sm" onClick={resend}>
                  {t("resend")}
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}
          {resent ? (
            <Alert>
              <AlertTitle>{t("sentTitle")}</AlertTitle>
              <AlertDescription>{t("sentDescription")}</AlertDescription>
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
