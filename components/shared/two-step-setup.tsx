"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import type { ActionResult } from "@/lib/action-result";
import { CopyValue } from "./copy-value";
import type { TwoStepEnrollment } from "./two-step";

const CODE_LENGTH = 6;

/**
 * Setting up the authentication app (JIKU-317): scan the QR code or type the
 * key, then enter a first code. On success the backup codes are shown once.
 */
export function TwoStepSetup({
  enrollment,
  onConfirm,
  after,
}: {
  enrollment: TwoStepEnrollment;
  onConfirm: (code: string) => Promise<ActionResult<{ backupCodes: string[] }>>;
  /** Shown under the backup codes once the app is set up, such as a way on. */
  after?: React.ReactNode;
}) {
  const t = useTranslations("common.twoStep");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [pending, startTransition] = useTransition();

  if (backupCodes) {
    return (
      <div className="flex flex-col gap-4">
        <BackupCodes codes={backupCodes} />
        {after}
      </div>
    );
  }

  function submit(value: string) {
    setError(null);
    startTransition(async () => {
      const result = await onConfirm(value);
      if (result.ok) setBackupCodes(result.data.backupCodes);
      else {
        setError(result.error);
        setCode("");
      }
    });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (code.length === CODE_LENGTH) submit(code);
      }}
      noValidate
    >
      <FieldGroup>
        <ol className="list-decimal space-y-1 ps-5 text-sm text-muted-foreground">
          <li>{t("setup.install")}</li>
          <li>{t("setup.scan")}</li>
          <li>{t("setup.enter")}</li>
        </ol>
        <div
          className="mx-auto size-48 rounded-lg border bg-white p-2 [&>svg]:size-full"
          role="img"
          aria-label={t("setup.qrLabel")}
          dangerouslySetInnerHTML={{ __html: enrollment.qrSvg }}
        />
        <div className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">{t("setup.key")}</span>
          <CopyValue
            value={enrollment.secret}
            label={t("setup.copyKey")}
            copiedLabel={t("copied")}
            className="break-all text-xs"
          />
        </div>
        <Field data-invalid={error !== null}>
          <FieldLabel htmlFor="setup-code">{t("codeLabel")}</FieldLabel>
          <InputOTP
            id="setup-code"
            maxLength={CODE_LENGTH}
            inputMode="numeric"
            pattern="^[0-9]*$"
            autoComplete="one-time-code"
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
          <FieldDescription>{t("setup.codeHelp")}</FieldDescription>
        </Field>
        {error ? <FieldError role="alert">{error}</FieldError> : null}
        <Button type="submit" disabled={pending || code.length !== CODE_LENGTH}>
          {pending ? <Spinner /> : null}
          {t("setup.confirm")}
        </Button>
      </FieldGroup>
    </form>
  );
}

/**
 * Backup codes, shown once (JIKU-317): each signs in once when the phone is lost.
 * Copied or downloaded as a text file, since the page will not show them again.
 */
export function BackupCodes({ codes }: { codes: string[] }) {
  const t = useTranslations("common.twoStep");
  const text = codes.join("\n");
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([`${t("backup.fileTitle")}\n\n${text}\n`], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "jiku-backup-codes.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="font-medium">{t("backup.title")}</p>
      <p className="text-muted-foreground">{t("backup.help")}</p>
      <ul className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/40 p-3 font-mono text-sm">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={copy}>
          {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          {copied ? t("copied") : t("backup.copy")}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={download}>
          <Download className="size-4" aria-hidden />
          {t("backup.download")}
        </Button>
      </div>
    </div>
  );
}
