"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FormFieldError } from "@/components/shared";
import { updateDraftAction } from "./event.service";
import {
  DELIVERY_MODES,
  eventFormSchema,
  INVITATION_CHANNEL_LABELS,
  INVITATION_CHANNELS,
  TIMEZONES,
  type DeliveryMode,
  type EventFormValues,
  type InvitationChannel,
} from "./schema";

const DEFAULT_BRAND_COLOR = "#1E293B";
const HEX = /^#[0-9a-fA-F]{6}$/;
const HTTPS = /^https:\/\/\S+$/;

/**
 * Everything about an event on one page, in sections an organizer can
 * jump to from the publish checklist (#details, #invitations, #client, #rules). A draft
 * is edited freely and saved from the bar that appears on the first change; a
 * published or cancelled event shows the same page read-only, because its
 * guests already hold what it says.
 */
export function EventSettingsForm({
  eventId,
  initialValues,
  editable,
}: {
  eventId: string;
  initialValues: EventFormValues;
  editable: boolean;
}) {
  const t = useTranslations("events.settings");
  const router = useRouter();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    mode: "onTouched",
    defaultValues: initialValues,
  });
  const transferAllowed = useWatch({ control, name: "transferAllowed" });
  const overbookingAllowed = useWatch({ control, name: "overbookingAllowed" });
  const [brandName, brandLogoUrl, brandColor] = useWatch({ control, name: ["brandName", "brandLogoUrl", "brandColor"] });

  async function onSubmit(values: EventFormValues) {
    const result = await updateDraftAction(eventId, values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    reset(values);
    toast.success(t("saved"));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {editable ? null : (
        <Alert>
          <AlertTitle>{t("locked.title")}</AlertTitle>
          <AlertDescription>{t("locked.description")}</AlertDescription>
        </Alert>
      )}
      <fieldset disabled={!editable} className="flex flex-col gap-6">
        <Card id="details" className="scroll-mt-20">
          <CardHeader>
            <CardTitle>{t("details.title")}</CardTitle>
            <CardDescription>{t("details.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                control={control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{t("name")}</FieldLabel>
                    <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                    <FormFieldError error={fieldState.error} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{t("descriptionLabel")}</FieldLabel>
                    <Textarea {...field} id={field.name} rows={3} aria-invalid={fieldState.invalid} />
                    <FieldDescription>{t("descriptionHint")}</FieldDescription>
                    <FormFieldError error={fieldState.error} />
                  </Field>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
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
                <Controller
                  control={control}
                  name="endLocal"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{t("end")}</FieldLabel>
                      <Input {...field} id={field.name} type="datetime-local" aria-invalid={fieldState.invalid} />
                      <FormFieldError error={fieldState.error} />
                    </Field>
                  )}
                />
              </div>
              <Controller
                control={control}
                name="timezone"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{t("timezone")}</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={!editable}>
                      <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((zone) => (
                          <SelectItem key={zone} value={zone}>
                            {zone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>{t("timezoneHint")}</FieldDescription>
                    <FormFieldError error={fieldState.error} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="location"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{t("location")}</FieldLabel>
                    <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                    <FormFieldError error={fieldState.error} />
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        <Card id="invitations" className="scroll-mt-20">
          <CardHeader>
            <CardTitle>{t("invitations.title")}</CardTitle>
            <CardDescription>{t("invitations.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                control={control}
                name="deliveryMode"
                render={({ field }) => (
                  <FieldSet>
                    <FieldLegend variant="label">{t("invitations.mode.label")}</FieldLegend>
                    <RadioGroup
                      value={field.value}
                      onValueChange={(value) => field.onChange(value as DeliveryMode)}
                      disabled={!editable}
                      className="grid gap-3 sm:grid-cols-3"
                    >
                      {DELIVERY_MODES.map((mode) => (
                        <ModeCard key={mode} value={mode} />
                      ))}
                    </RadioGroup>
                    <FieldDescription>{t("invitations.mode.hint")}</FieldDescription>
                  </FieldSet>
                )}
              />
              <Controller
                control={control}
                name="invitationChannels"
                render={({ field }) => (
                  <FieldSet>
                    <FieldLegend variant="label">{t("invitations.channels")}</FieldLegend>
                    <ToggleGroup
                      type="multiple"
                      variant="outline"
                      value={field.value}
                      onValueChange={(value) => field.onChange(value as InvitationChannel[])}
                      disabled={!editable}
                    >
                      {INVITATION_CHANNELS.map((channel) => (
                        <ToggleGroupItem key={channel} value={channel}>
                          {INVITATION_CHANNEL_LABELS[channel]}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                    <FieldDescription>{t("invitations.hint")}</FieldDescription>
                  </FieldSet>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        <Card id="client" className="scroll-mt-20">
          <CardHeader>
            <CardTitle>{t("client.title")}</CardTitle>
            <CardDescription>{t("client.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                control={control}
                name="brandName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{t("client.name")}</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder={t("client.namePlaceholder")}
                      aria-invalid={fieldState.invalid}
                    />
                    <FormFieldError error={fieldState.error} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="brandLogoUrl"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{t("client.logo")}</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="url"
                      inputMode="url"
                      placeholder="https://"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>{t("client.logoHint")}</FieldDescription>
                    <FormFieldError error={fieldState.error} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="brandColor"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{t("client.color")}</FieldLabel>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        aria-label={t("client.color")}
                        value={field.value || DEFAULT_BRAND_COLOR}
                        onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                        disabled={!editable}
                        className="h-9 w-12 cursor-pointer rounded-md border bg-transparent p-1 disabled:cursor-not-allowed"
                      />
                      <Input
                        {...field}
                        id={field.name}
                        placeholder={DEFAULT_BRAND_COLOR}
                        maxLength={7}
                        aria-invalid={fieldState.invalid}
                        className="max-w-32 font-mono uppercase"
                      />
                    </div>
                    <FormFieldError error={fieldState.error} />
                  </Field>
                )}
              />
              {brandName.trim() ? (
                <Field>
                  <FieldLabel>{t("client.preview")}</FieldLabel>
                  <div
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-white"
                    style={{ backgroundColor: HEX.test(brandColor) ? brandColor : DEFAULT_BRAND_COLOR }}
                  >
                    {HTTPS.test(brandLogoUrl) ? (
                      // eslint-disable-next-line @next/next/no-img-element -- an organizer-supplied external logo, not a local asset
                      <img src={brandLogoUrl} alt="" className="size-8 rounded-full bg-white object-contain" />
                    ) : null}
                    <span className="font-semibold">{brandName}</span>
                  </div>
                </Field>
              ) : null}
            </FieldGroup>
          </CardContent>
        </Card>

        <Card id="rules" className="scroll-mt-20">
          <CardHeader>
            <CardTitle>{t("rules.title")}</CardTitle>
            <CardDescription>{t("rules.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                control={control}
                name="transferAllowed"
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>{t("rules.transfer")}</FieldLabel>
                      <FieldDescription>{t("rules.transferHint")}</FieldDescription>
                    </FieldContent>
                    <Switch id={field.name} checked={field.value} onCheckedChange={field.onChange} />
                  </Field>
                )}
              />
              {transferAllowed ? (
                <Controller
                  control={control}
                  name="transferDeadlineLocal"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{t("rules.transferDeadline")}</FieldLabel>
                      <Input {...field} id={field.name} type="datetime-local" aria-invalid={fieldState.invalid} />
                      <FieldDescription>{t("rules.transferDeadlineHint")}</FieldDescription>
                      <FormFieldError error={fieldState.error} />
                    </Field>
                  )}
                />
              ) : null}
              <Controller
                control={control}
                name="overbookingAllowed"
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>{t("rules.overbooking")}</FieldLabel>
                      <FieldDescription>{t("rules.overbookingHint")}</FieldDescription>
                    </FieldContent>
                    <Switch id={field.name} checked={field.value} onCheckedChange={field.onChange} />
                  </Field>
                )}
              />
              {overbookingAllowed ? (
                <Controller
                  control={control}
                  name="maxOverbookingCount"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{t("rules.maxOverbooking")}</FieldLabel>
                      <Input
                        id={field.name}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={field.value ?? ""}
                        onBlur={field.onBlur}
                        onChange={(event) =>
                          field.onChange(event.target.value === "" ? null : Number(event.target.value))
                        }
                        aria-invalid={fieldState.invalid}
                        className="max-w-40"
                      />
                      <FormFieldError error={fieldState.error} />
                    </Field>
                  )}
                />
              ) : null}
            </FieldGroup>
          </CardContent>
        </Card>
      </fieldset>

      {editable && isDirty ? (
        <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur">
          <p className="text-sm text-muted-foreground">{t("unsaved")}</p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => reset()} disabled={isSubmitting}>
              {t("discard")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("saving") : t("save")}
            </Button>
          </div>
        </div>
      ) : null}
    </form>
  );
}

function ModeCard({ value }: { value: DeliveryMode }) {
  const t = useTranslations("events.settings.invitations.mode");
  return (
    <RadioGroupPrimitive.Item
      value={value}
      className="group flex flex-col rounded-xl border p-4 text-left transition-colors outline-none hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 data-[state=checked]:border-primary data-[state=checked]:bg-primary/[0.06]"
    >
      <span className="flex items-center justify-between gap-2 text-sm font-semibold">
        {t(`${value}.title`)}
        <Check className="size-4 text-primary opacity-0 group-data-[state=checked]:opacity-100" />
      </span>
      <span className="mt-1.5 text-xs text-muted-foreground">{t(`${value}.description`)}</span>
    </RadioGroupPrimitive.Item>
  );
}
