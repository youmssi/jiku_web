"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { bookAppointment, loadAppointment, type AppointmentLinkRef } from "@/components/modules/appointment/appointment.service";
import type { AppointmentServiceView, AppointmentSlot } from "@/components/modules/appointment/schema";

function formatInZone(iso: string, zone: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: zone,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

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

export function AppointmentBooking({ link }: { link: AppointmentLinkRef }) {
  const pathname = usePathname();
  const [view, setView] = useState<AppointmentServiceView | null>(null);
  const [date, setDate] = useState<string | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selected, setSelected] = useState<AppointmentSlot | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState<{ bookingToken: string; status: string } | null>(null);

  useEffect(() => {
    loadAppointment(link, date).then((loaded) => {
      setView(loaded);
      setSelected(null);
    });
  }, [link, date]);

  const book = useCallback(async () => {
    if (!selected) return;
    if (name.trim().length < 2 || phone.trim().length < 6) {
      setError("Indiquez votre nom et un numéro valide.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const result = await bookAppointment(link, {
      clientName: name,
      clientPhone: phone,
      startsAt: selected.startsAt,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "La réservation a échoué.");
      return;
    }
    setBooked({ bookingToken: result.data.bookingToken, status: result.data.status });
  }, [link, name, phone, selected]);

  const selectedDate = useMemo(() => (date ? parseDateOnly(date) : todayUtc()), [date]);

  const suiviUrl = useMemo(
    () => (booked ? `${pathname}/suivi/${booked.bookingToken}` : null),
    [booked, pathname],
  );

  if (booked) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Votre rendez-vous est enregistré</CardTitle>
            <CardDescription>
              {booked.status === "PENDING"
                ? "En attente de confirmation : vous recevrez la confirmation du professionnel."
                : "Votre rendez-vous est confirmé."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="rounded-xl border p-3">
              <QRCodeSVG value={booked.bookingToken} size={180} />
            </div>
            <div>
              <p className="font-medium">{view?.name}</p>
              <p className="text-sm text-muted-foreground">
                {selected ? formatInZone(selected.startsAt, view?.timezone ?? "UTC") : ""}
              </p>
              {view?.professionals.length ? (
                <p className="text-sm text-muted-foreground">Avec {view.professionals.join(", ")}</p>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">N° de réservation : {booked.bookingToken.slice(0, 8)}</p>
            {suiviUrl ? (
              <Button asChild variant="outline" className="w-full rounded-full">
                <a href={suiviUrl}>Voir ou annuler mon rendez-vous</a>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{view ? view.name : "Rendez-vous"}</CardTitle>
          <CardDescription>
            {view
              ? view.professionals.length
                ? `Avec ${view.professionals.join(", ")} — sans compte, en trois gestes.`
                : "Choisissez un créneau, sans compte."
              : "Chargement…"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Impossible</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setDate(addDays(selectedDate, -1))}
              disabled={selectedDate <= todayUtc()}
            >
              <ChevronLeft className="size-3.5" />
              <span className="sr-only">Jour précédent</span>
            </Button>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 font-normal capitalize">
                  <CalendarIcon className="size-3.5" />
                  {format(selectedDate, "EEEE d MMMM", { locale: fr })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  locale={fr}
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
            <Button variant="outline" size="icon-sm" onClick={() => setDate(addDays(selectedDate, 1))}>
              <ChevronRight className="size-3.5" />
              <span className="sr-only">Jour suivant</span>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(view?.slots ?? []).map((slot) => (
              <button
                key={slot.startsAt}
                type="button"
                onClick={() => setSelected(slot)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                  selected?.startsAt === slot.startsAt
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/40 hover:border-primary/30",
                )}
              >
                {new Intl.DateTimeFormat("fr-FR", {
                  timeZone: view?.timezone ?? "UTC",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(slot.startsAt))}
              </button>
            ))}
            {(view?.slots ?? []).length === 0 ? (
              <p className="col-span-2 text-center text-sm text-muted-foreground">
                Aucun créneau ouvert ce jour-là.
              </p>
            ) : null}
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="client-name">Votre nom</FieldLabel>
              <Input id="client-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </Field>
            <Field>
              <FieldLabel htmlFor="client-phone">Votre téléphone</FieldLabel>
              <Input
                id="client-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                autoComplete="tel"
                placeholder="+224 6XX XX XX XX"
              />
            </Field>
          </FieldGroup>
          <Button onClick={() => void book()} disabled={submitting || !selected} className="w-full rounded-full">
            {submitting ? "Réservation…" : "Réserver ce créneau"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
