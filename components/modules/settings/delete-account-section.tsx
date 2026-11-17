"use client";

import { useState, useTransition } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";
import { GoogleButton } from "@/components/modules/identity";
import { requestAccountDeletionAction } from "@/components/modules/settings/settings.service";
import type { AccountDeletionStatus } from "@/components/modules/settings/schema";

/**
 * Deleting one's own account (JIKU-316). The dialog names what goes with the
 * account, asks to agree when organizations are owned alone, and confirms the
 * identity with the password, or Google for accounts that have none. The
 * request signs out; signing in again within the grace period cancels it.
 */
export function DeleteAccountSection({ status }: { status: AccountDeletionStatus }) {
  const t = useTranslations("settings.account.deletion");
  const format = useFormatter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const owned = status.soleOwnedOrganizations ?? [];
  const withPassword = status.confirmWithPassword ?? true;
  const ready = owned.length === 0 || agreed;

  function submit(credentials: { password?: string; googleIdToken?: string }) {
    setError(null);
    startTransition(async () => {
      // Success signs out and redirects server-side; only a failure returns.
      const result = await requestAccountDeletionAction({ ...credentials, deleteOrganizations: owned.length > 0 && agreed });
      if (result && !result.ok) setError(result.error);
    });
  }

  async function confirmWithGoogle(idToken: string) {
    if (!ready) {
      setError(t("errors.agree"));
      return;
    }
    submit({ googleIdToken: idToken });
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setPassword("");
      setAgreed(false);
      setError(null);
    }
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="size-4" aria-hidden />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        {status.scheduledFor ? (
          <p>{t("scheduled", { date: format.dateTime(new Date(status.scheduledFor), { dateStyle: "long" }) })}</p>
        ) : null}
        <ul className="list-disc space-y-1 ps-5 text-muted-foreground">
          <li>{t("whatGoes.account")}</li>
          <li>{t("whatGoes.grace")}</li>
          <li>{t("whatGoes.invoices")}</li>
        </ul>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="self-start">
              {t("trigger")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dialog.title")}</DialogTitle>
              <DialogDescription>{t("dialog.description")}</DialogDescription>
            </DialogHeader>
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!ready) {
                  setError(t("errors.agree"));
                  return;
                }
                submit({ password });
              }}
            >
              {owned.length > 0 ? (
                <div className="flex flex-col gap-3 rounded-lg border p-3 text-sm">
                  <p>{t("dialog.soleOwned", { count: owned.length })}</p>
                  <ul className="list-disc ps-5 font-medium">
                    {owned.map((organization) => (
                      <li key={organization.id}>{organization.name}</li>
                    ))}
                  </ul>
                  <p className="text-muted-foreground">
                    {t.rich("dialog.shareFirst", {
                      members: (chunks) => (
                        <Link href={`${ROUTES.SETTINGS}?tab=members`} className="underline underline-offset-4">
                          {chunks}
                        </Link>
                      ),
                    })}
                  </p>
                  <Field orientation="horizontal">
                    <Checkbox
                      id="delete-organizations"
                      checked={agreed}
                      onCheckedChange={(value) => setAgreed(value === true)}
                    />
                    <FieldLabel htmlFor="delete-organizations">{t("dialog.agree", { count: owned.length })}</FieldLabel>
                  </Field>
                </div>
              ) : null}
              {withPassword ? (
                <Field>
                  <FieldLabel htmlFor="delete-password">{t("dialog.password")}</FieldLabel>
                  <PasswordInput
                    id="delete-password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    aria-invalid={error !== null && ready}
                    required
                  />
                </Field>
              ) : (
                <div className="flex flex-col gap-2 text-sm">
                  <p>{t("dialog.google")}</p>
                  <GoogleButton onCredential={confirmWithGoogle} />
                </div>
              )}
              {error ? <FieldError role="alert">{error}</FieldError> : null}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
                  {t("dialog.cancel")}
                </Button>
                {withPassword ? (
                  <Button type="submit" variant="destructive" disabled={pending || !password}>
                    {pending ? <Spinner /> : null}
                    {t("dialog.confirm")}
                  </Button>
                ) : null}
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
