"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Plus } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
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
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormFieldError } from "@/components/shared";
import { trackEvent } from "@/lib/analytics";
import { serviceManageRoute } from "@/lib/constants";
import { zoneCity } from "@/lib/datetime";
import { DEFAULT_TIMEZONE } from "@/lib/timezones";
import {
  createServiceSchema,
  DURATION_CHOICES,
  SERVICE_TIMEZONES,
  type CreateServiceInput,
} from "@/components/modules/services/schema";
import { createServiceAction } from "@/components/modules/services/services.service";

/**
 * Service creation (JIKU-252): a name and how long one appointment lasts. The
 * service takes bookings at once, with the organizer receiving clients on the
 * default opening hours, and opens on its own page where its link is ready to
 * share and its hours can be adjusted. The timezone folds into one line.
 */
export function CreateServiceButton({ variant = "default" }: { variant?: "default" | "outline" }) {
  const t = useTranslations("services.create");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [zoneOpen, setZoneOpen] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateServiceInput>({
    resolver: zodResolver(createServiceSchema),
    mode: "onTouched",
    defaultValues: { name: "", timezone: DEFAULT_TIMEZONE, durationMinutes: 30 },
  });
  const zone = useWatch({ control, name: "timezone" });

  async function onSubmit(values: CreateServiceInput) {
    const result = await createServiceAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    trackEvent("service_created");
    reset();
    setZoneOpen(false);
    setOpen(false);
    router.push(serviceManageRoute(result.data.id));
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          reset();
          setZoneOpen(false);
        }
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
        <form id="new-service-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("name")}</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    autoFocus
                    placeholder={t("namePlaceholder")}
                    aria-invalid={fieldState.invalid}
                  />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="durationMinutes"
              render={({ field }) => (
                <FieldSet>
                  <FieldLegend variant="label">{t("duration")}</FieldLegend>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={String(field.value)}
                    onValueChange={(value) => value && field.onChange(Number(value))}
                    className="flex-wrap"
                  >
                    {DURATION_CHOICES.map((minutes) => (
                      <ToggleGroupItem key={minutes} value={String(minutes)} className="gap-1.5 max-md:h-11">
                        {field.value === minutes ? <Check aria-hidden /> : null}
                        {t("minutes", { count: minutes })}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </FieldSet>
              )}
            />
            {zoneOpen ? (
              <Controller
                control={control}
                name="timezone"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{t("timezone")}</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_TIMEZONES.map((zone) => (
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
            ) : (
              <Button type="button" variant="link" className="self-start px-0 max-md:px-0" onClick={() => setZoneOpen(true)}>
                {t("timezoneSummary", { zone: zoneCity(zone) })}
              </Button>
            )}
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button type="submit" form="new-service-form" disabled={isSubmitting}>
            {isSubmitting ? t("submitting") : t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
