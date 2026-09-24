"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormFieldError } from "@/components/shared";
import { trackEvent } from "@/lib/analytics";
import { eventEditRoute } from "@/lib/constants";
import { createDraftAction } from "./event.service";
import {
  emptyEventValues,
  quickCreateEventSchema,
  TIMEZONES,
  type QuickCreateEventValues,
} from "./schema";

/**
 * Event creation, in a dialog so it opens from wherever the organizer is (the
 * events list, the Today page). Asks only what a draft needs to exist; every
 * other setting has a real default and is filled in on the event's own page,
 * which is exactly where creating the draft sends you next.
 */
export function NewEventDialog({ variant = "default" }: { variant?: "default" | "outline" }) {
  const t = useTranslations("events.create");
  const tCommon = useTranslations("common.actions");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<QuickCreateEventValues>({
    resolver: zodResolver(quickCreateEventSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      timezone: emptyEventValues.timezone,
      startLocal: "",
    },
  });

  async function onSubmit(values: QuickCreateEventValues) {
    const result = await createDraftAction({ ...emptyEventValues, ...values });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t("created"));
    // Every new event starts on the free tier (JIKU-32); it is the only
    // value known at creation time, before any usage/paid unlock exists.
    trackEvent("event_created", { tier: "FREE" });
    reset();
    setOpen(false);
    router.push(eventEditRoute(result.data.id));
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant={variant}>
          <Plus data-icon="inline-start" />
          {t("trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form id="new-event-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("name")}</FieldLabel>
                  <Input {...field} id={field.name} autoFocus aria-invalid={fieldState.invalid} />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="timezone"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("timezone")}</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder={t("timezonePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((zone) => (
                        <SelectItem key={zone} value={zone}>
                          {zone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="startLocal"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("start")}</FieldLabel>
                  <Input {...field} id={field.name} type="datetime-local" aria-invalid={fieldState.invalid} />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            {tCommon("cancel")}
          </Button>
          <Button type="submit" form="new-event-form" disabled={isSubmitting}>
            {isSubmitting ? t("submitting") : t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
