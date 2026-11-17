"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Fingerprint, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useLocalDateTime } from "@/components/shared";
import { createPasskey, passkeyCancelled, passkeysSupported } from "@/lib/webauthn";
import {
  deletePasskeyAction,
  finishPasskeyRegistrationAction,
  renamePasskeyAction,
  startPasskeyRegistrationAction,
} from "@/components/modules/settings/settings.service";
import type { PasskeyView } from "@/components/modules/settings/schema";

const noSubscription = () => () => {};

type Editing = { mode: "add" } | { mode: "rename"; passkey: PasskeyView } | null;

/**
 * Passkeys (JIKU-318): sign in with the device's fingerprint, face or PIN
 * instead of the password and the code. Added, renamed and removed here; each
 * addition is announced by email.
 */
export function PasskeysCard({ passkeys }: { passkeys: PasskeyView[] }) {
  const t = useTranslations("settings.security.passkeys");
  const formatDate = useLocalDateTime(true);
  const supported = useSyncExternalStore(noSubscription, passkeysSupported, () => true);
  const [editing, setEditing] = useState<Editing>(null);
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function open(next: Editing) {
    setEditing(next);
    setLabel(next?.mode === "rename" ? next.passkey.label : "");
    setError(null);
  }

  function save() {
    if (!editing) return;
    setError(null);
    startTransition(async () => {
      if (editing.mode === "rename") {
        const result = await renamePasskeyAction(editing.passkey.id, label);
        if (!result.ok) return setError(result.error);
        toast.success(t("renamed"));
        return setEditing(null);
      }
      const ceremony = await startPasskeyRegistrationAction();
      if (!ceremony.ok) return setError(ceremony.error);
      let credential: Record<string, unknown>;
      try {
        credential = await createPasskey(ceremony.data.options);
      } catch (cause) {
        if (!passkeyCancelled(cause)) setError(t("deviceFailed"));
        return;
      }
      const result = await finishPasskeyRegistrationAction({ ceremonyId: ceremony.data.ceremonyId, credential, label });
      if (!result.ok) return setError(result.error);
      toast.success(t("added"));
      setEditing(null);
    });
  }

  function remove(passkey: PasskeyView) {
    startTransition(async () => {
      const result = await deletePasskeyAction(passkey.id);
      if (result.ok) toast.success(t("removed"));
      else toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="size-4" aria-hidden />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        {passkeys.length > 0 ? (
          <ul className="flex flex-col divide-y rounded-lg border">
            {passkeys.map((passkey) => (
              <li key={passkey.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="font-medium break-words">{passkey.label}</p>
                  <p className="text-muted-foreground">
                    {passkey.lastUsedAt
                      ? t("lastUsed", { date: formatDate(passkey.lastUsedAt) })
                      : t("addedOn", { date: formatDate(passkey.createdAt ?? null) })}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" aria-label={t("rename")} onClick={() => open({ mode: "rename", passkey })}>
                    <Pencil className="size-4" aria-hidden />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("remove")}
                    className="text-destructive"
                    onClick={() => remove(passkey)}
                    disabled={pending}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        {supported ? (
          <Button variant="outline" className="self-start" onClick={() => open({ mode: "add" })}>
            {t("add")}
          </Button>
        ) : (
          <p className="text-muted-foreground">{t("unsupported")}</p>
        )}
      </CardContent>

      <Dialog open={editing !== null} onOpenChange={(value) => !value && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.mode === "rename" ? t("renameTitle") : t("addTitle")}</DialogTitle>
            <DialogDescription>{editing?.mode === "rename" ? t("renameDescription") : t("addDescription")}</DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <Field data-invalid={error !== null}>
              <FieldLabel htmlFor="passkey-label">{t("label")}</FieldLabel>
              <Input
                id="passkey-label"
                value={label}
                maxLength={100}
                placeholder={t("labelPlaceholder")}
                onChange={(event) => setLabel(event.target.value)}
                required
              />
            </Field>
            {error ? <FieldError role="alert">{error}</FieldError> : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={pending}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={pending || !label.trim()}>
                {pending ? <Spinner /> : null}
                {editing?.mode === "rename" ? t("save") : t("continue")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
