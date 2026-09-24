"use client";

import { useState } from "react";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
 * Event creation, in a dialog so it doesn't compete for space with the events
 * list — the same pattern as inviting a teammate or granting a trial. Asks for
 * only what a draft needs to exist (name, timezone, a start time); everything
 * else — description, location, transfer/overbooking, invitation channels —
 * has a real default and is filled in on the event's own Settings tab, which
 * is exactly where creating the draft sends you next.
 */
export function NewEventDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<QuickCreateEventValues>({
    resolver: zodResolver(quickCreateEventSchema),
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
    toast.success("Draft created");
    if (result.data?.id) {
      // Every new event starts on the free tier (JIKU-32); it is the only
      // value known at creation time, before any usage/paid unlock exists.
      trackEvent("event_created", { tier: "FREE" });
      reset();
      setOpen(false);
      router.push(eventEditRoute(result.data.id));
    }
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
        <Button>
          <Plus className="size-3.5" data-icon="inline-start" />
          New event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create an event</DialogTitle>
          <DialogDescription>
            Name it and set a timezone — everything else, you&apos;ll fill in
            on the event&apos;s own page.
          </DialogDescription>
        </DialogHeader>
        <form id="new-event-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Event name</FieldLabel>
                <Input {...field} id={field.name} autoFocus aria-invalid={fieldState.invalid} />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
          <Controller
            control={control}
            name="timezone"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Timezone</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Select a timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
          <Controller
            control={control}
            name="startLocal"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Starts (optional)</FieldLabel>
                <Input {...field} id={field.name} type="datetime-local" aria-invalid={fieldState.invalid} />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="new-event-form" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
