"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { bookAppointment, loadAppointment } from "@/components/modules/appointment/appointment.service";
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

function addDays(base: Date, days: number): string {
  const d = new Date(base.getTime() + days * 86_400_000);
  return d.toISOString().slice(0, 10);
}

export function AppointmentBooking({ token }: { token: string }) {
  const pathname = usePathname();
  const [view, setView] = useState<AppointmentServiceView | null>(null);
  const [date, setDate] = useState<string | undefined>(undefined);
  const [selected, setSelected] = useState<AppointmentSlot | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState<{ bookingToken: string; status: string } | null>(null);

  useEffect(() => {
    loadAppointment(token, date).then((loaded) => {
      setView(loaded);
      setSelected(null);
    });
  }, [token, date]);

  const book = useCallback(async () => {
    if (!selected) return;
    if (name.trim().length < 2 || phone.trim().length < 6) {
      setError("Indiquez votre nom et un numéro valide.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const result = await bookAppointment(token, {
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
  }, [token, name, phone, selected]);

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
          <div className="flex items-center justify-between text-sm">
            <Button variant="outline" size="sm" onClick={() => setDate(addDays(new Date(), -1))}>
              Jour précédent
            </Button>
            <span className="text-muted-foreground">Choisissez une heure</span>
            <Button variant="outline" size="sm" onClick={() => setDate(addDays(new Date(), 1))}>
              Jour suivant
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
