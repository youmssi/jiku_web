"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ActionResult } from "./admin.service";
import type { ActionDialogFormValues } from "./schema";

/**
 * The one dialog shape every back-office action uses (JIKU-46): a confirmation
 * with a mandatory free-text field (note, reason, or transaction reference)
 * submitted to a server action. Keeping it shared means every destructive
 * action gets the same confirm-with-context discipline.
 */
export function ActionDialog({
  trigger,
  title,
  description,
  fieldLabel,
  confirmLabel,
  destructive = false,
  onConfirm,
}: {
  trigger: string;
  title: string;
  description: string;
  fieldLabel: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: (value: string) => Promise<ActionResult>;
}) {
  const [open, setOpen] = useState(false);

  // The only rule is "the field is filled" — the message names the field so it
  // stays specific to each action without a separate schema per caller.
  const schema = useMemo(
    () =>
      z.object({
        value: z.string().trim().min(1, `${fieldLabel} is required.`),
      }),
    [fieldLabel],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ActionDialogFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { value: "" },
  });

  async function submit(values: ActionDialogFormValues) {
    const { error } = await onConfirm(values.value.trim());
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(`${title} — done.`);
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={destructive ? "destructive" : "outline"}>
          {trigger}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} noValidate>
          <Controller
            control={control}
            name="value"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{fieldLabel}</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  autoFocus
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={destructive ? "destructive" : "default"}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Working…" : confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
