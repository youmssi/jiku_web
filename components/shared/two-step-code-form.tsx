"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import type { ActionResult } from "@/lib/action-result";
import type { TwoStepInput } from "./two-step";

const CODE_LENGTH = 6;

/**
 * The code step of a sign-in (JIKU-317): six digits from the authentication app,
 * filled in by the phone's keyboard suggestion where it offers one, or a backup
 * code for a lost phone. A finished sign-in redirects; only a failure returns.
 */
export function TwoStepCodeForm({
  onVerify,
  allowTrust = true,
  onCancel,
}: {
  onVerify: (input: TwoStepInput) => Promise<ActionResult<unknown> | void>;
  allowTrust?: boolean;
  onCancel?: () => void;
}) {
  const t = useTranslations("common.twoStep");
  const [useBackup, setUseBackup] = useState(false);
  const [code, setCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const ready = useBackup ? backupCode.trim().length >= 8 : code.length === CODE_LENGTH;

  function submit(next?: string) {
    const value = next ?? code;
    setError(null);
    startTransition(async () => {
      const result = await onVerify(
        useBackup ? { backupCode: backupCode.trim(), trustDevice } : { code: value, trustDevice },
      );
      if (result && !result.ok) {
        setError(result.error);
        setCode("");
      }
    });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (ready) submit();
      }}
      noValidate
    >
      <FieldGroup>
        {useBackup ? (
          <Field data-invalid={error !== null}>
            <FieldLabel htmlFor="backup-code">{t("backupLabel")}</FieldLabel>
            <Input
              id="backup-code"
              value={backupCode}
              onChange={(event) => setBackupCode(event.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-invalid={error !== null}
              placeholder="XXXXX-XXXXX"
            />
            <FieldDescription>{t("backupHelp")}</FieldDescription>
          </Field>
        ) : (
          <Field data-invalid={error !== null}>
            <FieldLabel htmlFor="two-step-code">{t("codeLabel")}</FieldLabel>
            <InputOTP
              id="two-step-code"
              maxLength={CODE_LENGTH}
              inputMode="numeric"
              pattern="^[0-9]*$"
              autoComplete="one-time-code"
              autoFocus
              value={code}
              onChange={setCode}
              onComplete={(value: string) => submit(value)}
              aria-invalid={error !== null}
            >
              <InputOTPGroup>
                {Array.from({ length: CODE_LENGTH }, (_, index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <FieldDescription>{t("codeHelp")}</FieldDescription>
          </Field>
        )}
        {error ? <FieldError role="alert">{error}</FieldError> : null}
        {allowTrust ? (
          <Field orientation="horizontal">
            <Checkbox id="trust-device" checked={trustDevice} onCheckedChange={(value) => setTrustDevice(value === true)} />
            <FieldLabel htmlFor="trust-device" className="font-normal">
              {t("trustDevice")}
            </FieldLabel>
          </Field>
        ) : null}
        <Button type="submit" className="w-full" disabled={pending || !ready}>
          {pending ? <Spinner /> : null}
          {t("verify")}
        </Button>
        <div className="flex flex-wrap justify-between gap-2 text-sm">
          <button
            type="button"
            className="underline-offset-4 hover:underline"
            onClick={() => {
              setUseBackup((value) => !value);
              setError(null);
            }}
          >
            {useBackup ? t("useApp") : t("useBackup")}
          </button>
          {onCancel ? (
            <button type="button" className="text-muted-foreground underline-offset-4 hover:underline" onClick={onCancel}>
              {t("back")}
            </button>
          ) : null}
        </div>
      </FieldGroup>
    </form>
  );
}
