"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { FormFieldError } from "@/components/shared";
import { confirmPhoneAction, requestPhoneCodeAction } from "./verification.service";
import { codeSchema, phoneSchema, type CodeInput, type PhoneInput, type PhoneStatus } from "./schema";

/**
 * Confirms the number the organization is reached on, by a six-digit code sent
 * by SMS. A personal verification needs it; a confirmed number can be changed,
 * which asks for a new code.
 */
export function PhoneStep({ phone }: { phone: PhoneStatus }) {
  const t = useTranslations("settings.verification.phone");
  const router = useRouter();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [editing, setEditing] = useState(!phone.verified);

  const phoneForm = useForm<PhoneInput>({
    resolver: zodResolver(phoneSchema),
    mode: "onTouched",
    defaultValues: { phone: phone.phone ?? "" },
  });
  const codeForm = useForm<CodeInput>({ resolver: zodResolver(codeSchema), defaultValues: { code: "" } });

  async function sendCode(values: PhoneInput) {
    const result = await requestPhoneCodeAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setSentTo(values.phone.replace(/\s+/g, ""));
    codeForm.reset({ code: "" });
    toast.success(t("sent"));
  }

  async function confirm(values: CodeInput) {
    const result = await confirmPhoneAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setSentTo(null);
    setEditing(false);
    toast.success(t("confirmed"));
    router.refresh();
  }

  if (phone.verified && !editing) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">{t("verifiedAs", { phone: phone.phone ?? "" })}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
          {t("change")}
        </Button>
      </div>
    );
  }

  if (sentTo) {
    return (
      <form onSubmit={codeForm.handleSubmit(confirm)} noValidate>
        <FieldGroup>
          <Controller
            control={codeForm.control}
            name="code"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="verification-code">{t("codeLabel")}</FieldLabel>
                <InputOTP id="verification-code" maxLength={6} inputMode="numeric" autoComplete="one-time-code" {...field}>
                  <InputOTPGroup>
                    {Array.from({ length: 6 }, (_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <FieldDescription>{t("codeHelp", { phone: sentTo })}</FieldDescription>
                <FormFieldError error={fieldState.error} />
              </Field>
            )}
          />
          <Field orientation="horizontal">
            <Button type="submit" disabled={codeForm.formState.isSubmitting}>
              {codeForm.formState.isSubmitting ? t("confirming") : t("confirm")}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setSentTo(null)}>
              {t("changeNumber")}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    );
  }

  return (
    <form onSubmit={phoneForm.handleSubmit(sendCode)} noValidate>
      <FieldGroup>
        <Controller
          control={phoneForm.control}
          name="phone"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="verification-phone">{t("label")}</FieldLabel>
              <Input
                {...field}
                id="verification-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+224 6XX XX XX XX"
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>{t("help")}</FieldDescription>
              <FormFieldError error={fieldState.error} />
            </Field>
          )}
        />
        <Field orientation="horizontal">
          <Button type="submit" disabled={phoneForm.formState.isSubmitting}>
            {phoneForm.formState.isSubmitting ? t("sending") : t("send")}
          </Button>
          {phone.verified ? (
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
              {t("cancel")}
            </Button>
          ) : null}
        </Field>
      </FieldGroup>
    </form>
  );
}
