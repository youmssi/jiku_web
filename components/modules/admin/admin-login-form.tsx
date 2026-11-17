"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { FormFieldError, TwoStepCodeForm, TwoStepSetup } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  adminConfirmSetupAction,
  adminFinishSetupAction,
  adminLoginAction,
  adminVerifyTwoStepAction,
  type AdminSignInStep,
} from "./admin.service";
import {
  adminLoginSchema,
  type AdminLoginFormValues,
} from "./schema";

/**
 * Back-office sign-in: email and password only. No third-party providers are
 * enabled for this surface, so no social button is rendered at all rather than
 * a dead one an operator could click. A code from the authentication app follows
 * (JIKU-317); an administrator without one sets it up here first.
 */
export function AdminLoginForm() {
  const t = useTranslations("admin.login");
  const tStep = useTranslations("common.twoStep");
  const [formError, setFormError] = useState<string | null>(null);
  const [step, setStep] = useState<AdminSignInStep | null>(null);
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
    // A successful login redirects; a failure or the next step returns.
    if (!result.ok) {
      setFormError(result.error);
      toast.error(result.error);
    } else {
      setStep(result.data);
    }
  }

  if (step?.step === "code") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{tStep("description")}</p>
        <TwoStepCodeForm onVerify={adminVerifyTwoStepAction} onCancel={() => setStep(null)} />
      </div>
    );
  }

  if (step?.step === "setup") {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <p className="font-medium">{t("setupTitle")}</p>
          <p className="text-sm text-muted-foreground">{t("setupDescription")}</p>
        </div>
        <TwoStepSetup
          enrollment={step.enrollment}
          onConfirm={adminConfirmSetupAction}
          after={
            <Button
              className="w-full"
              onClick={async () => {
                const result = await adminFinishSetupAction();
                if (result && !result.ok) {
                  setStep(null);
                  setFormError(result.error);
                }
              }}
            >
              {t("continue")}
            </Button>
          }
        />
      </div>
    );
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
