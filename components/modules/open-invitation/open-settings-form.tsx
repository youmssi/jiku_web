"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormFieldError, InfoHint } from "@/components/shared";
import { saveOpenInvitationAction } from "./open-invitation.service";
import { settingsSchema, type OpenInvitation, type SettingsInput } from "./schema";

/** `2026-12-01T18:00` in the browser's zone, as a date-time input expects; empty for none. */
function toLocalInput(instant: string | null): string {
  if (!instant) return "";
  const date = new Date(instant);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * The settings of an open invitation (JIKU-184): on or off, the host's word,
 * companions, when answers close, and whether the people who answered are told
 * by WhatsApp if the event is cancelled (JIKU-187), which a paid tier includes.
 */
export function OpenSettingsForm({ eventId, invitation }: { eventId: string; invitation: OpenInvitation }) {
  const t = useTranslations("events.openInvitation.settings");
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
    reset,
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema(invitation.maxCompanionsAllowed)),
    mode: "onTouched",
    defaultValues: {
      enabled: invitation.enabled,
      welcomeMessage: invitation.welcomeMessage ?? "",
      maxCompanions: invitation.maxCompanions,
      closesAt: toLocalInput(invitation.closesAt),
      notifyOnCancel: invitation.notifyOnCancel,
    },
  });

  async function onSubmit(values: SettingsInput) {
    const result = await saveOpenInvitationAction(eventId, values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    reset(values);
    toast.success(t("saved"));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 rounded-xl border p-4">
      <p className="text-sm font-medium">{t("title")}</p>
      <FieldGroup>
        <Controller
          control={control}
          name="enabled"
          render={({ field }) => (
            <Field orientation="horizontal">
              <Label htmlFor="open-enabled" help={t("enabledHelp")} more={t("moreInfo")}>
                {t("enabled")}
              </Label>
              <Switch id="open-enabled" checked={field.value} onCheckedChange={field.onChange} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="welcomeMessage"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="open-welcome">{t("welcome")}</FieldLabel>
              <Textarea {...field} id="open-welcome" rows={3} maxLength={500} placeholder={t("welcomePlaceholder")} />
              <FormFieldError error={fieldState.error} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="maxCompanions"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Label htmlFor="open-companions" help={t("companionsHelp", { max: invitation.maxCompanionsAllowed })} more={t("moreInfo")}>
                {t("companions")}
              </Label>
              <Input
                id="open-companions"
                type="number"
                inputMode="numeric"
                min={0}
                max={invitation.maxCompanionsAllowed}
                value={Number.isNaN(field.value) ? "" : field.value}
                onChange={(event) => field.onChange(event.target.valueAsNumber)}
                onBlur={field.onBlur}
                className="w-28"
              />
              <FormFieldError error={fieldState.error} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="closesAt"
          render={({ field }) => (
            <Field>
              <Label htmlFor="open-closes" help={t("closesAtHelp")} more={t("moreInfo")}>
                {t("closesAt")}
              </Label>
              <Input {...field} id="open-closes" type="datetime-local" className="w-60" />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="notifyOnCancel"
          render={({ field }) => (
            <Field orientation="horizontal">
              <Label
                htmlFor="open-notify-cancel"
                help={invitation.cancelNoticeIncluded ? `${t("notifyOnCancelHelp")} ${t("notifyOnCancelIncluded")}` : t("notifyOnCancelHelp")}
                more={t("moreInfo")}
              >
                {t("notifyOnCancel")}
              </Label>
              <Switch
                id="open-notify-cancel"
                checked={invitation.cancelNoticeIncluded || field.value}
                disabled={invitation.cancelNoticeIncluded}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />
      </FieldGroup>
      <Button type="submit" className="self-start" disabled={isSubmitting || !isDirty}>
        {t("save")}
      </Button>
    </form>
  );
}

/** A field's label with its explanation behind an ⓘ (JIKU-188), rather than a sentence under the field. */
function Label({ htmlFor, help, more, children }: { htmlFor: string; help: string; more: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 items-center gap-1">
      <FieldLabel htmlFor={htmlFor}>{children}</FieldLabel>
      <InfoHint label={more}>{help}</InfoHint>
    </div>
  );
}
