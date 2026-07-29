"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { trackEvent } from "@/lib/analytics";
import { ROUTES, eventEditRoute } from "@/lib/constants";
import {
  INVITATION_CHANNELS,
  INVITATION_CHANNEL_LABELS,
  TIMEZONES,
  eventFormSchema,
  type EventFormValues,
} from "@/components/modules/event/schema";
import {
  cancelEventAction,
  createDraftAction,
  publishEventAction,
  updateDraftAction,
} from "@/components/modules/event/event.service";

interface EventWizardProps {
  eventId?: string;
  initialValues: EventFormValues;
  status?: string;
}

const STEPS = ["Event details", "Event settings"] as const;

export function EventWizard({ eventId, initialValues, status }: EventWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    mode: "onTouched",
    defaultValues: initialValues,
  });

  const transferAllowed = useWatch({ control, name: "transferAllowed" });
  const overbookingAllowed = useWatch({ control, name: "overbookingAllowed" });
  const watchedName = useWatch({ control, name: "name" });
  const watchedStart = useWatch({ control, name: "startLocal" });
  const watchedChannels = useWatch({ control, name: "invitationChannels" });
  const isPublished = status === "PUBLISHED";
  const isCancelled = status === "CANCELLED";
  // Published events are read-only; cancelled events are terminal.
  const isLocked = isPublished || isCancelled;

  const publishBlockers: string[] = [];
  if (!eventId) {
    publishBlockers.push("save the draft first");
  }
  if (!watchedName?.trim()) {
    publishBlockers.push("a name");
  }
  if (!watchedStart) {
    publishBlockers.push("a start date and time");
  }
  if (!watchedChannels || watchedChannels.length === 0) {
    publishBlockers.push("at least one invitation channel");
  }
  const canPublish = Boolean(eventId) && publishBlockers.length === 0 && !isLocked;

  async function goToSettings() {
    if (await trigger(["name", "timezone"])) {
      setStep(1);
    }
  }

  async function onSaveDraft(values: EventFormValues) {
    setFormError(null);
    if (eventId) {
      const result = await updateDraftAction(eventId, values);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      reset(values);
      toast.success("Draft saved");
    } else {
      const result = await createDraftAction(values);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      toast.success("Draft created");
      if (result.data?.id) {
        // Every new event starts on the free tier (JIKU-32); it is the only
        // value known at creation time, before any usage/paid unlock exists.
        trackEvent("event_created", { tier: "FREE" });
        router.replace(eventEditRoute(result.data.id));
      }
    }
  }

  function onInvalid() {
    setStep(0);
    setFormError("Please complete the required event details first.");
  }

  async function onPublish() {
    if (!eventId) {
      return;
    }
    setFormError(null);
    setIsPublishing(true);
    try {
      const saved = await updateDraftAction(eventId, getValues());
      if (!saved.ok) {
        setFormError(saved.error);
        return;
      }
      const result = await publishEventAction(eventId);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      toast.success("Event published");
      router.push(ROUTES.EVENTS);
    } finally {
      setIsPublishing(false);
    }
  }

  async function onCancelEvent() {
    if (!eventId) {
      return;
    }
    setFormError(null);
    setIsCancelling(true);
    try {
      const result = await cancelEventAction(eventId);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      toast.success("Event cancelled, guests are being notified");
      router.push(ROUTES.EVENTS);
      router.refresh();
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">
          {eventId ? "Edit event" : "Create an event"}
        </CardTitle>
        <CardDescription>
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSaveDraft, onInvalid)} noValidate className="flex flex-col gap-(--card-spacing)">
        <CardContent>
          <FieldGroup>
            {formError ? (
              <Alert variant="destructive">
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}
            {isPublished ? (
              <Alert>
                <AlertTitle>This event is published</AlertTitle>
                <AlertDescription>
                  Published events can no longer be edited.
                </AlertDescription>
              </Alert>
            ) : null}
            {isCancelled ? (
              <Alert variant="destructive">
                <AlertTitle>This event has been cancelled</AlertTitle>
                <AlertDescription>
                  All tickets were invalidated and every invited guest has been
                  notified. A cancelled event cannot be edited or re-published.
                </AlertDescription>
              </Alert>
            ) : null}

            {step === 0 ? (
              <>
                <Controller
                  control={control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Event name</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        disabled={isLocked}
                      />
                      {fieldState.invalid ? (
                        <FieldError errors={[fieldState.error]} />
                      ) : null}
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                      <Textarea {...field} id={field.name} rows={3} disabled={isLocked} />
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="timezone"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Timezone</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLocked}
                      >
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
                      <FieldDescription>
                        Guests always see the event in this timezone.
                      </FieldDescription>
                      {fieldState.invalid ? (
                        <FieldError errors={[fieldState.error]} />
                      ) : null}
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="startLocal"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Starts</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="datetime-local"
                        disabled={isLocked}
                      />
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="endLocal"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Ends</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="datetime-local"
                        disabled={isLocked}
                      />
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="location"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Location</FieldLabel>
                      <Input {...field} id={field.name} disabled={isLocked} />
                    </Field>
                  )}
                />
              </>
            ) : null}

            {step === 1 ? (
              <>
                <Controller
                  control={control}
                  name="placementEnabled"
                  render={({ field }) => (
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>Assigned seating</FieldLabel>
                        <FieldDescription>
                          Let guests be placed at specific tables or seats.
                        </FieldDescription>
                      </FieldContent>
                      <Switch
                        id={field.name}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLocked}
                      />
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="transferAllowed"
                  render={({ field }) => (
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>Allow ticket transfer</FieldLabel>
                        <FieldDescription>
                          Guests can pass their ticket to someone else.
                        </FieldDescription>
                      </FieldContent>
                      <Switch
                        id={field.name}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLocked}
                      />
                    </Field>
                  )}
                />
                {transferAllowed ? (
                  <Controller
                    control={control}
                    name="transferDeadlineLocal"
                    render={({ field }) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Transfer deadline</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          type="datetime-local"
                          disabled={isLocked}
                        />
                        <FieldDescription>
                          After this time, transfers are closed.
                        </FieldDescription>
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
                        <FieldLabel htmlFor={field.name}>Allow overbooking</FieldLabel>
                        <FieldDescription>
                          Accept more confirmations than capacity, up to a limit.
                        </FieldDescription>
                      </FieldContent>
                      <Switch
                        id={field.name}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLocked}
                      />
                    </Field>
                  )}
                />
                {overbookingAllowed ? (
                  <Controller
                    control={control}
                    name="maxOverbookingCount"
                    render={({ field }) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Maximum overbooking</FieldLabel>
                        <Input
                          id={field.name}
                          type="number"
                          min={0}
                          value={field.value ?? ""}
                          onBlur={field.onBlur}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value === "" ? null : Number(event.target.value),
                            )
                          }
                          disabled={isLocked}
                        />
                      </Field>
                    )}
                  />
                ) : null}
                <Controller
                  control={control}
                  name="invitationChannels"
                  render={({ field }) => (
                    <FieldSet>
                      <FieldLegend variant="label">Invitation channels</FieldLegend>
                      <FieldDescription>
                        How guests receive their invitation. At least one is required to
                        publish.
                      </FieldDescription>
                      <FieldGroup data-slot="checkbox-group">
                        {INVITATION_CHANNELS.map((channel) => (
                          <Field key={channel} orientation="horizontal">
                            <Checkbox
                              id={`channel-${channel}`}
                              checked={field.value.includes(channel)}
                              onCheckedChange={(checked) =>
                                field.onChange(
                                  checked
                                    ? [...field.value, channel]
                                    : field.value.filter((value) => value !== channel),
                                )
                              }
                              disabled={isLocked}
                            />
                            <FieldLabel
                              htmlFor={`channel-${channel}`}
                              className="font-normal"
                            >
                              {INVITATION_CHANNEL_LABELS[channel]}
                            </FieldLabel>
                          </Field>
                        ))}
                      </FieldGroup>
                    </FieldSet>
                  )}
                />
              </>
            ) : null}
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <div className="flex w-full items-center justify-between gap-2">
            <div>
              {step === 1 ? (
                <Button type="button" variant="ghost" onClick={() => setStep(0)}>
                  Back
                </Button>
              ) : null}
            </div>
            <div className="flex gap-2">
              {step === 0 ? (
                <Button type="button" variant="outline" onClick={goToSettings}>
                  Next
                </Button>
              ) : null}
{!isPublished ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => reset()}
                  disabled={!isDirty || isSubmitting || isPublishing}
                >
                  Cancel
                </Button>
              ) : null}
              <Button
                type="submit"
                disabled={isSubmitting || isPublished || !isDirty}
              >
                {isSubmitting ? "Saving…" : "Save draft"}
              </Button>
              {isPublished ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" disabled={isCancelling}>
                      {isCancelling ? "Cancelling…" : "Cancel event"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel this event?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This cannot be undone. Every issued ticket becomes invalid
                        immediately, no more RSVPs are accepted, and all invited
                        guests are notified that the event will not take place.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep the event</AlertDialogCancel>
                      <AlertDialogAction onClick={onCancelEvent}>
                        Cancel the event
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" disabled={!canPublish || isPublishing}>
                      {isPublishing ? "Publishing…" : "Publish"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Publish this event?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Publishing makes the event live and locks its details. You
                        won&apos;t be able to edit it afterwards. Guests can start
                        receiving invitations.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep editing</AlertDialogCancel>
                      <AlertDialogAction onClick={onPublish}>
                        Publish event
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          {!isLocked && publishBlockers.length > 0 ? (
            <FieldDescription className="w-full">
              To publish: {publishBlockers.join(", ")}.
            </FieldDescription>
          ) : null}
        </CardFooter>
      </form>
    </Card>
  );
}
