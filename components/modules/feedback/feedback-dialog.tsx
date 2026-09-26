"use client";

import { useTranslations } from "next-intl";
import { Controller, useForm, useWatch } from "react-hook-form";
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
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FormFieldError } from "@/components/shared";
import { usePathname } from "@/i18n/navigation";
import { sendFeedbackAction } from "./feedback.service";
import { FEEDBACK_KINDS, feedbackFormSchema, type FeedbackFormValues } from "./schema";

/**
 * A message to the platform team: a problem, a question, an idea or a
 * complaint. The page the organizer is on travels with it, and the reply goes
 * to the address they choose (their own by default).
 */
export function FeedbackDialog({
  open,
  onOpenChange,
  email,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
}) {
  const t = useTranslations("feedback.form");
  const pathname = usePathname();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    mode: "onTouched",
    defaultValues: { kind: "IDEA", message: "", contactEmail: email },
  });
  const kind = useWatch({ control, name: "kind" });

  async function onSubmit(values: FeedbackFormValues) {
    const outcome = await sendFeedbackAction(values, pathname);
    if (!outcome.ok) {
      toast.error(outcome.error);
      return;
    }
    toast.success(t(`sent.${values.kind}`));
    reset({ kind: "IDEA", message: "", contactEmail: email });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form id="feedback-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              control={control}
              name="kind"
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("kind")}</FieldLabel>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={field.value}
                    onValueChange={(value) => value && field.onChange(value)}
                    className="flex w-full flex-wrap"
                  >
                    {FEEDBACK_KINDS.map((value) => (
                      <ToggleGroupItem key={value} value={value} className="flex-1 px-3">
                        {t(`kinds.${value}`)}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </Field>
              )}
            />
            <Controller
              control={control}
              name="message"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("message")}</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    rows={5}
                    placeholder={t(`placeholders.${kind}`)}
                    aria-invalid={fieldState.invalid}
                  />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="contactEmail"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("contactEmail")}</FieldLabel>
                  <Input {...field} id={field.name} type="email" autoComplete="email" aria-invalid={fieldState.invalid} />
                  <FieldDescription>{t("contactHint")}</FieldDescription>
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button type="submit" form="feedback-form" disabled={isSubmitting}>
            {isSubmitting ? t("sending") : t("send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
