"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatLocalDateTime } from "@/lib/datetime";
import { transferTicketAction } from "@/components/modules/invitation/invitation.service";
import {
  transferTicketSchema,
  type TransferTicketInput,
} from "@/components/modules/invitation/schema";

/** Lets a confirmed guest hand their ticket to someone else, when the event allows it. */
export function TransferTicketDialog({
  token,
  deadline,
}: {
  token: string;
  /** When transfers close, shown so the guest knows how long they have. */
  deadline: string | null;
}) {
  const [open, setOpen] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<TransferTicketInput>({
    resolver: zodResolver(transferTicketSchema),
    mode: "onTouched",
    defaultValues: { firstName: "", lastName: "", email: "", phoneNumber: "" },
  });

  async function onSubmit(values: TransferTicketInput) {
    const result = await transferTicketAction(token, values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`Ticket transferred to ${values.firstName} ${values.lastName}.`);
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Transfer to someone else</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogHeader>
            <DialogTitle>Transfer your ticket</DialogTitle>
            <DialogDescription>
              They&apos;ll get their own invitation and this ticket will no longer be valid for you.
              {deadline
                ? ` Transfers close on ${formatLocalDateTime(deadline)}.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>First name</FieldLabel>
                    <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="lastName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Last name</FieldLabel>
                    <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
            </div>
            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Their email</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    id={field.name}
                    type="email"
                    inputMode="email"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Their WhatsApp number (optional)</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    id={field.name}
                    type="tel"
                    inputMode="tel"
                    placeholder="+224620000000"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Transferring…" : "Transfer ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
