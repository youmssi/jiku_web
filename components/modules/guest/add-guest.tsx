"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { addGuestAction } from "@/components/modules/guest/guest.service";
import {
  singleGuestSchema,
  type SingleGuestInput,
} from "@/components/modules/guest/schema";

const EMPTY_GUEST: SingleGuestInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

/** Manual single-guest entry — a one-row import that reuses the CSV pipeline. */
export function AddGuest({ eventId }: { eventId: string }) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<SingleGuestInput>({
    resolver: zodResolver(singleGuestSchema),
    mode: "onTouched",
    defaultValues: EMPTY_GUEST,
  });

  async function onSubmit(values: SingleGuestInput) {
    const outcome = await addGuestAction(eventId, values);
    if (!outcome.ok) {
      toast.error(outcome.error);
      return;
    }
    const result = outcome.data;
    if (result.imported > 0) {
      toast.success(`${values.firstName} ${values.lastName} was added.`);
      reset(EMPTY_GUEST);
    } else if (result.skippedDuplicates > 0) {
      toast.info("This guest is already on the list.");
    } else {
      toast.error(result.failures[0]?.reason ?? "We couldn't add this guest.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field orientation="responsive">
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
        </Field>
        <Field orientation="responsive">
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="tel"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </Field>
        <FieldDescription>
          Provide at least an email or a phone number so this guest can be invited.
        </FieldDescription>
        <Field orientation="horizontal">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding…" : "Add guest"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => reset(EMPTY_GUEST)}
            disabled={!isDirty || isSubmitting}
          >
            Clear
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
