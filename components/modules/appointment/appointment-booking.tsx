"use client";

import { useEffect, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enUS, fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { trackEvent } from "@/lib/analytics";
import { upperFirst } from "@/lib/text";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormFieldError, OrganizerMark, VerifiedBadge } from "@/components/shared";
import { bookAppointment, loadAppointment, type AppointmentLinkRef } from "@/components/modules/appointment/appointment.service";
import {
  bookingSchema,
  type AppointmentServiceView,
  type AppointmentSlot,
  type BookingInput,
} from "@/components/modules/appointment/schema";

/** UTC calendar date, `YYYY-MM-DD` — the format every date-only string in this component uses. */
function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Reconstructs the calendar Date a date-only string encodes. */
function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

/** Today, at UTC midnight — the same convention every date-only string here uses. */
function todayUtc(): Date {
  return parseDateOnly(toDateOnly(new Date()));
}

/** Days offered in the strip; further days stay one tap away in the calendar. */
const STRIP_DAYS = 14;

type Period = "morning" | "afternoon" | "evening";

/** Groups the open times by part of the day, in the service's timezone, so a long day reads at a glance. */
function byPeriod(slots: AppointmentSlot[], timeZone: string): [Period, AppointmentSlot[]][] {
  const hourOf = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", hourCycle: "h23" });
  const groups: Record<Period, AppointmentSlot[]> = { morning: [], afternoon: [], evening: [] };
  for (const slot of slots) {
    const hour = Number(hourOf.format(new Date(slot.startsAt)));
    groups[hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"].push(slot);
  }
  return (Object.entries(groups) as [Period, AppointmentSlot[]][]).filter(([, list]) => list.length > 0);
}

/**
 * A client books a time without an account (JIKU-86, JIKU-249): who they book
 * with, a day from the strip, a time grouped by part of the day, then name and
 * number in a bottom panel. The booking opens on its own page, which the client
 * can reload or keep. Times show in the service's timezone, in the visitor's
 * language.
 */
export function AppointmentBooking({ link }: { link: AppointmentLinkRef }) {
  const t = useTranslations("guest.appointment");
  const format = useFormatter();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [view, setView] = useState<AppointmentServiceView | null>(null);
  const [date, setDate] = useState<string>(() => toDateOnly(todayUtc()));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [picked, setPicked] = useState<AppointmentSlot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    mode: "onTouched",
    defaultValues: { clientName: "", clientPhone: "", startsAt: "" },
  });

  useEffect(() => {
    loadAppointment(link, date).then(setView);
  }, [link, date]);

  function pick(slot: AppointmentSlot) {
    setError(null);
    setValue("startsAt", slot.startsAt, { shouldValidate: true });
    setPicked(slot);
  }

  async function onSubmit(values: BookingInput) {
    setError(null);
    const result = await bookAppointment(link, values);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    trackEvent("appointment_booked", { status: result.data.status });
    router.push(`${pathname}/bookings/${result.data.bookingToken}`);
  }

  const timeZone = view?.timezone ?? "UTC";
  const selectedDate = parseDateOnly(date);
  const today = todayUtc();
  const strip = Array.from({ length: STRIP_DAYS }, (_, i) => toDateOnly(new Date(today.getTime() + i * 86_400_000)));
  const names = view?.professionals.join(", ") ?? "";
  const groupSessions = (view?.clientsPerSlot ?? 1) > 1;
  const periods = view ? byPeriod(view.slots, timeZone) : [];
  const time = (slot: AppointmentSlot) => format.dateTime(new Date(slot.startsAt), { timeZone, hour: "2-digit", minute: "2-digit" });

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-4 py-8">
      <header className="flex flex-col gap-3">
        {view?.organizerName ? (
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <OrganizerMark name={view.organizerName} logoUrl={view.logoUrl ?? null} />
            <span>{view.organizerName}</span>
            <VerifiedBadge kind={view.organizerVerification} />
          </div>
        ) : null}
        <div>
          <h1 className="text-2xl font-semibold">{view ? view.name : t("booking.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {view ? (names ? t("booking.withNames", { names }) : t("booking.noAccount")) : t("booking.loading")}
          </p>
        </div>
      </header>

      {view?.bookingPaused ? (
        <Alert>
          <AlertTitle>{t("booking.pausedTitle")}</AlertTitle>
          <AlertDescription>
            {view.organizerName ? t("booking.pausedWithName", { organizer: view.organizerName }) : t("booking.paused")}
          </AlertDescription>
        </Alert>
      ) : (
        <>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <div className="flex gap-2" role="listbox" aria-label={t("booking.day")}>
          {strip.map((day) => {
            const d = parseDateOnly(day);
            const selected = day === date;
            return (
              <button
                key={day}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => setDate(day)}
                className={cn(
                  "flex min-h-14 min-w-14 shrink-0 flex-col items-center justify-center rounded-xl border px-2 text-sm transition-colors",
                  selected ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40",
                )}
              >
                <span className="text-xs">{format.dateTime(d, { timeZone: "UTC", weekday: "short" })}</span>
                <span className="font-semibold">{format.dateTime(d, { timeZone: "UTC", day: "numeric" })}</span>
              </button>
            );
          })}
          </div>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={t("booking.otherDay")}
                className="flex min-h-14 min-w-14 shrink-0 items-center justify-center rounded-xl border border-dashed"
              >
                <CalendarIcon className="size-4" aria-hidden />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                locale={locale === "en" ? enUS : fr}
                selected={selectedDate}
                defaultMonth={selectedDate}
                disabled={{ before: today }}
                onSelect={(day) => {
                  if (!day) return;
                  setDate(toDateOnly(day));
                  setCalendarOpen(false);
                }}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <p className="text-sm font-medium">
          {upperFirst(format.dateTime(selectedDate, { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" }), locale)}
        </p>

        {view && view.slots.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">{t("booking.noSlots")}</p>
        ) : null}

        {periods.map(([period, slots]) => (
          <section key={period} className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t(`booking.periods.${period}`)}</h2>
            <div className="grid grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.startsAt}
                  type="button"
                  onClick={() => pick(slot)}
                  className="flex min-h-11 flex-col items-center justify-center rounded-xl border px-1 text-sm font-medium transition-colors hover:border-primary/40"
                >
                  {time(slot)}
                  {groupSessions && slot.placesLeft !== undefined ? (
                    <span className="text-[11px] font-normal text-muted-foreground">
                      {t("booking.placesLeft", { count: slot.placesLeft })}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </section>
        ))}
        </>
      )}

      <Drawer open={picked !== null} onOpenChange={(open) => !open && setPicked(null)}>
        <DrawerContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mx-auto flex w-full max-w-lg flex-col">
            <DrawerHeader className="text-left">
              <DrawerTitle>{view?.name}</DrawerTitle>
              <DrawerDescription>
                {picked
                  ? [
                      upperFirst(
                        format.dateTime(new Date(picked.startsAt), { timeZone, weekday: "short", day: "numeric", month: "short" }),
                        locale,
                      ),
                      time(picked),
                      names ? t("booking.withNamesShort", { names }) : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")
                  : null}
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-4 px-4">
              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>{t("booking.failed")}</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <FieldGroup>
                <Controller
                  control={control}
                  name="clientName"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="client-name">{t("booking.name")}</FieldLabel>
                      <Input {...field} id="client-name" autoComplete="name" aria-invalid={fieldState.invalid} />
                      <FormFieldError error={fieldState.error} />
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="clientPhone"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="client-phone">{t("booking.phone")}</FieldLabel>
                      <Input
                        {...field}
                        id="client-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="+224 6XX XX XX XX"
                        aria-invalid={fieldState.invalid}
                      />
                      <FormFieldError error={fieldState.error} />
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>
            <DrawerFooter>
              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full rounded-full">
                {isSubmitting ? t("booking.submitting") : t("booking.submit")}
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
