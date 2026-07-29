"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trackEvent } from "@/lib/analytics";
import { formatAmount } from "@/lib/currency";
import { reservationPaymentUrl, reservationStatusUrl } from "@/lib/constants";
import { createReservationAction, quoteBookingAction } from "@/components/modules/booking/booking.service";
import { EVENT_TYPES, EVENT_TYPE_LABELS, reservationSchema, type ReservationInput } from "@/components/modules/booking/schema";
import type { BookingQuote } from "@/components/modules/booking/schema";

const MIN_DATE = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const QUOTE_DEBOUNCE_MS = 400;

export function ReservationForm({ acquisitionSource }: { acquisitionSource: string | null }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [quote, setQuote] = useState<BookingQuote | null>(null);
  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    mode: "onTouched",
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      eventType: "MARIAGE",
      eventDate: "",
      guestCountEstimate: undefined,
    },
  });

  const guestCountEstimate = watch("guestCountEstimate");
  const eventType = watch("eventType");

  useEffect(() => {
    trackEvent("booking_started", { source: acquisitionSource, event_type: eventType });
    // Fire once per mount only — a later eventType change is not a new "start".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const count = Number(guestCountEstimate);
    if (!Number.isFinite(count) || count <= 0) {
      setQuote(null);
      return;
    }
    const timeout = setTimeout(() => {
      quoteBookingAction(count).then(setQuote);
    }, QUOTE_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [guestCountEstimate]);

  async function onSubmit(values: ReservationInput) {
    setFormError(null);
    const result = await createReservationAction(values, acquisitionSource);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    const { id, accessToken, depositAmountMinor, tier } = result.data;
    trackEvent("booking_submitted", { tier, guest_count: values.guestCountEstimate });
    router.push(
      depositAmountMinor > 0 ? reservationPaymentUrl(id, accessToken) : reservationStatusUrl(id, accessToken),
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Réservez votre date</CardTitle>
          <p className="text-sm text-muted-foreground">
            Bloquez votre date dès maintenant avec 30 % d&apos;acompte. Le reste se règle tranquillement avant le jour J.
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-(--card-spacing)">
          <CardContent>
            <FieldGroup>
              {formError ? (
                <Alert variant="destructive">
                  <AlertTitle>Réservation impossible</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}
              <Controller
                control={control}
                name="customerName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Votre nom</FieldLabel>
                    <Input {...field} id={field.name} autoComplete="name" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="customerPhone"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Téléphone</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="tel"
                      autoComplete="tel"
                      placeholder="+224 6XX XX XX XX"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="customerEmail"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input {...field} id={field.name} type="email" autoComplete="email" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="eventType"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Type d&apos;événement</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {EVENT_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="eventDate"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Date de l&apos;événement</FieldLabel>
                    <Input {...field} id={field.name} type="date" min={MIN_DATE} aria-invalid={fieldState.invalid} />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="guestCountEstimate"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Nombre d&apos;invités estimé</FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id={field.name}
                      type="number"
                      min={1}
                      inputMode="numeric"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : (
                      <FieldDescription>Gratuit jusqu&apos;à 100 invités cumulés sur votre compte.</FieldDescription>
                    )}
                  </Field>
                )}
              />

              {quote ? (
                <div className="rounded-lg border bg-muted/50 p-4 text-sm">
                  <p className="font-medium">
                    Palier {quote.tier} — {formatAmount(quote.totalAmountMinor, quote.currency)}
                  </p>
                  {quote.depositAmountMinor > 0 ? (
                    <p className="mt-1 text-muted-foreground">
                      Acompte à régler maintenant : {formatAmount(quote.depositAmountMinor, quote.currency)} (30 %). Solde :{" "}
                      {formatAmount(quote.balanceAmountMinor, quote.currency)}.
                    </p>
                  ) : (
                    <p className="mt-1 text-muted-foreground">Aucun acompte à régler — votre accès est immédiat.</p>
                  )}
                </div>
              ) : null}
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Réservation en cours…" : "Réserver ma date"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
