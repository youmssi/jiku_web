"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { KeyRound, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { BackupCodes, TwoStepCodeForm, TwoStepSetup, useLocalDateTime, type TwoStepEnrollment } from "@/components/shared";
import {
  closeOtherSessionsAction,
  closeSessionAction,
  confirmTwoStepAction,
  disableTwoStepAction,
  renewBackupCodesAction,
  startTwoStepAction,
} from "@/components/modules/settings/settings.service";
import type { MfaStatus, SessionView } from "@/components/modules/settings/schema";

type Dialogs = "setup" | "disable" | "renew" | null;

/**
 * Settings → Security (JIKU-317): the authentication app as a second factor,
 * and the browsers signed in to the account, each of which can be signed out.
 */
export function SecurityView({ mfa, sessions }: { mfa: MfaStatus; sessions: SessionView[] }) {
  const t = useTranslations("settings.security");
  const formatDateTime = useLocalDateTime();
  const formatDate = useLocalDateTime(true);
  const [dialog, setDialog] = useState<Dialogs>(null);
  const [enrollment, setEnrollment] = useState<TwoStepEnrollment | null>(null);
  const [pending, startTransition] = useTransition();

  function openSetup() {
    startTransition(async () => {
      const result = await startTwoStepAction();
      if (result.ok) {
        setEnrollment(result.data);
        setDialog("setup");
      } else toast.error(result.error);
    });
  }

  function closeSession(id: string) {
    startTransition(async () => {
      const result = await closeSessionAction(id);
      if (result.ok) toast.success(t("sessions.closed"));
      else toast.error(result.error);
    });
  }

  function closeOthers() {
    startTransition(async () => {
      const result = await closeOtherSessionsAction();
      if (result.ok) toast.success(t("sessions.closedOthers"));
      else toast.error(result.error);
    });
  }

  const others = sessions.filter((session) => !session.current).length;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4" aria-hidden />
            {t("mfa.title")}
            {mfa.enabled ? <Badge variant="secondary">{t("mfa.on")}</Badge> : null}
          </CardTitle>
          <CardDescription>{t("mfa.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          {mfa.enabled ? (
            <>
              <p>
                {t("mfa.enabledSince", {
                  date: formatDate(mfa.enabledAt ?? null),
                })}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <KeyRound className="size-4" aria-hidden />
                {t("mfa.backupLeft", { count: mfa.backupCodesLeft ?? 0 })}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setDialog("renew")}>
                  {t("mfa.renew")}
                </Button>
                <Button variant="ghost" className="text-destructive" onClick={() => setDialog("disable")}>
                  {t("mfa.disable")}
                </Button>
              </div>
            </>
          ) : (
            <Button className="self-start" onClick={openSetup} disabled={pending}>
              {pending ? <Spinner /> : null}
              {t("mfa.enable")}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MonitorSmartphone className="size-4" aria-hidden />
            {t("sessions.title")}
          </CardTitle>
          <CardDescription>{t("sessions.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <ul className="flex flex-col divide-y rounded-lg border">
            {sessions.map((session) => (
              <li key={session.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="font-medium">
                    {session.device || t("sessions.unknownDevice")}
                    {session.current ? (
                      <Badge variant="secondary" className="ms-2">
                        {t("sessions.current")}
                      </Badge>
                    ) : null}
                  </p>
                  <p className="text-muted-foreground">
                    {t("sessions.lastUsed", { date: formatDateTime(session.lastUsedAt) })}
                  </p>
                </div>
                {session.current ? null : (
                  <Button variant="ghost" size="sm" onClick={() => closeSession(session.id)} disabled={pending}>
                    {t("sessions.close")}
                  </Button>
                )}
              </li>
            ))}
          </ul>
          {others > 0 ? (
            <Button variant="outline" className="self-start" onClick={closeOthers} disabled={pending}>
              {t("sessions.closeOthers")}
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={dialog === "setup"} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("mfa.setupTitle")}</DialogTitle>
            <DialogDescription>{t("mfa.setupDescription")}</DialogDescription>
          </DialogHeader>
          {enrollment ? (
            <TwoStepSetup
              enrollment={enrollment}
              onConfirm={confirmTwoStepAction}
              after={<Button onClick={() => setDialog(null)}>{t("mfa.done")}</Button>}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "disable"} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("mfa.disableTitle")}</DialogTitle>
            <DialogDescription>{t("mfa.disableDescription")}</DialogDescription>
          </DialogHeader>
          <TwoStepCodeForm
            allowTrust={false}
            onVerify={async (input) => {
              const result = await disableTwoStepAction(input);
              if (result.ok) {
                toast.success(t("mfa.disabled"));
                setDialog(null);
              }
              return result;
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "renew"} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("mfa.renewTitle")}</DialogTitle>
            <DialogDescription>{t("mfa.renewDescription")}</DialogDescription>
          </DialogHeader>
          <RenewBackupCodes onDone={() => setDialog(null)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** New backup codes take a code from the app; the old ones stop working. */
function RenewBackupCodes({ onDone }: { onDone: () => void }) {
  const t = useTranslations("settings.security");
  const tStep = useTranslations("common.twoStep");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [pending, startTransition] = useTransition();

  if (codes) {
    return (
      <div className="flex flex-col gap-4">
        <BackupCodes codes={codes} />
        <Button onClick={onDone}>{t("mfa.done")}</Button>
      </div>
    );
  }

  function submit(value: string) {
    setError(null);
    startTransition(async () => {
      const result = await renewBackupCodesAction(value);
      if (result.ok) setCodes(result.data.backupCodes);
      else {
        setError(result.error);
        setCode("");
      }
    });
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (code.length === 6) submit(code);
      }}
    >
      <Field data-invalid={error !== null}>
        <FieldLabel htmlFor="renew-code">{tStep("codeLabel")}</FieldLabel>
        <InputOTP
          id="renew-code"
          maxLength={6}
          inputMode="numeric"
          pattern="^[0-9]*$"
          autoComplete="one-time-code"
          value={code}
          onChange={setCode}
          onComplete={(value: string) => submit(value)}
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }, (_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </Field>
      {error ? <FieldError role="alert">{error}</FieldError> : null}
      <Button type="submit" disabled={pending || code.length !== 6}>
        {pending ? <Spinner /> : null}
        {t("mfa.renew")}
      </Button>
    </form>
  );
}
