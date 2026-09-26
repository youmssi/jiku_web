"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QRCodeSVG } from "qrcode.react";
import { enUS, fr } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { trackEvent } from "@/lib/analytics";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormFieldError } from "@/components/shared";
import { cn } from "@/lib/utils";
import { bookAppointment, loadAppointment, type AppointmentLinkRef } from "@/components/modules/appointment/appointment.service";
import {
  bookingSchema,
  type AppointmentServiceView,
  type BookingInput,
} from "@/components/modules/appointment/schema";

/** UTC calendar date, `YYYY-MM-DD` — the format every date-only string in this component uses. */
function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(base: Date, days: number): string {
  return toDateOnly(new Date(base.getTime() + days * 86_400_000));
}

/** Reconstructs the calendar Date a date-only string encodes. */
function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

/** Today, at UTC midnight — the same convention every date-only string here uses. */
function todayUtc(): Date {
  return parseDateOnly(toDateOnly(new Date()));
}

/**
 * A client books a time without an account (JIKU-86): a day, one of its open
 * times, a name and a phone number. Times show in the service's timezone, in
 * the visitor's language.
 */
export function AppointmentBooking({ link }: { link: AppointmentLinkRef }) {
  const t = useTranslations("guest.appointment");
  const format = useFormatter();
  const locale = useLocale();
  const pathname = usePathname();
  const [view, setView] = useState<AppointmentServiceView | null>(null);
  const [date, setDate] = useState<string | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booked, setBooked] = useState<{ bookingToken: string; status: string; startsAt: string } | null>(null);

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
  const startsAt = useWatch({ control, name: "startsAt" });

  useEffect(() => {
    loadAppointment(link, date).then((loaded) => {
      setView(loaded);
      setValue("startsAt", "");
    });
  }, [link, date, setValue]);

  async function onSubmit(values: BookingInput) {
    setError(null);
    const result = await bookAppointment(link, values);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    trackEvent("appointment_booked", { status: result.data.status });
    setBooked({ bookingToken: result.data.bookingToken, status: result.data.status, startsAt: values.startsAt });
  }

  const timeZone = view?.timezone ?? "UTC";
  const selectedDate = useMemo(() => (date ? parseDateOnly(date) : todayUtc()), [date]);
  const calendarLocale = locale === "en" ? enUS : fr;
  const names = view?.professionals.join(", ") ?? "";
  const groupSessions = (view?.clientsPerSlot ?? 1) > 1;

  if (booked) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>{t("booked.title")}</CardTitle>
            <CardDescription>{booked.status === "PENDING" ? t("booked.PENDING") : t("booked.CONFIRMED")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="rounded-xl border p-3">
              <QRCodeSVG value={booked.bookingToken} size={180} />
            </div>
            <div>
              <p className="font-medium">{view?.name}</p>
              <p className="text-sm text-muted-foreground">
                {format.dateTime(new Date(booked.startsAt), {
                  timeZone,
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {names ? <p className="text-sm text-muted-foreground">{t("booked.withNames", { names })}</p> : null}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("booked.number", { number: booked.bookingToken.slice(0, 8) })}
            </p>
            <Button asChild variant="outline" className="w-full rounded-full">
              <a href={`${pathname}/bookings/${booked.bookingToken}`}>{t("booked.manage")}</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{view ? view.name : t("booking.title")}</CardTitle>
          <CardDescription>
            {view ? (names ? t("booking.withNames", { names }) : t("booking.noAccount")) : t("booking.loading")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            {error ? (
              <Alert variant="destructive">
                <AlertTitle>{t("booking.failed")}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setDate(addDays(selectedDate, -1))}
                disabled={selectedDate <= todayUtc()}
              >
                <ChevronLeft className="size-3.5" />
                <span className="sr-only">{t("booking.previousDay")}</span>
              </Button>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="gap-2 font-normal capitalize">
                    <CalendarIcon className="size-3.5" />
                    {format.dateTime(selectedDate, { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    locale={calendarLocale}
                    selected={selectedDate}
                    defaultMonth={selectedDate}
                    disabled={{ before: todayUtc() }}
                    onSelect={(day) => {
                      if (!day) return;
                      setDate(toDateOnly(day));
                      setCalendarOpen(false);
                    }}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setDate(addDays(selectedDate, 1))}
              >
                <ChevronRight className="size-3.5" />
                <span className="sr-only">{t("booking.nextDay")}</span>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(view?.slots ?? []).map((slot) => (
                <button
                  key={slot.startsAt}
                  type="button"
                  aria-pressed={startsAt === slot.startsAt}
                  onClick={() => setValue("startsAt", slot.startsAt, { shouldValidate: true })}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                    startsAt === slot.startsAt
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/40 hover:border-primary/30",
                  )}
                >
                  {format.dateTime(new Date(slot.startsAt), { timeZone, hour: "2-digit", minute: "2-digit" })}
                  {groupSessions && slot.placesLeft !== undefined ? (
                    <span className="block text-xs font-normal text-muted-foreground">
                      {t("booking.placesLeft", { count: slot.placesLeft })}
                    </span>
                  ) : null}
                </button>
              ))}
              {view && view.slots.length === 0 ? (
                <p className="col-span-2 text-center text-sm text-muted-foreground">{t("booking.noSlots")}</p>
              ) : null}
            </div>
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
            <Button type="submit" disabled={isSubmitting || !startsAt} className="w-full rounded-full">
              {isSubmitting ? t("booking.submitting") : t("booking.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
