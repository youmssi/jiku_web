"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cancelAppointment, loadBookingStatus } from "@/components/modules/appointment/appointment.service";
import type { AppointmentStatusView } from "@/components/modules/appointment/schema";

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

export function AppointmentStatus({
  token,
  bookingToken,
  timezone,
}: {
  token: string;
  bookingToken: string;
  timezone: string;
}) {
  const [view, setView] = useState<AppointmentStatusView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const refresh = useCallback(() => {
    loadBookingStatus(token, bookingToken).then((loaded) => setView(loaded));
  }, [token, bookingToken]);

  useEffect(refresh, [refresh]);

  const cancel = useCallback(async () => {
    setCancelling(true);
    const result = await cancelAppointment(token, bookingToken);
    setCancelling(false);
    if (!result.ok) {
      setMessage(result.error ?? "Annulation impossible.");
      return;
    }
    setMessage("Votre rendez-vous a été annulé.");
    setView(null);
  }, [token, bookingToken]);

  if (!view) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Réservation introuvable</CardTitle>
            <CardDescription>
              {message ?? "Vérifiez le lien ou votre numéro de réservation."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Votre rendez-vous</CardTitle>
          <CardDescription>
            {view.status === "PENDING"
              ? "En attente de confirmation."
              : view.status === "CONFIRMED"
                ? "Confirmé."
                : view.status}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {message ? (
            <Alert variant={view ? "default" : "destructive"}>
              <AlertTitle>{view ? "Annulation" : "Attention"}</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ) : null}
          {view.clientName ? <p className="font-medium">{view.clientName}</p> : null}
          <p className="text-sm text-muted-foreground">{formatInZone(view.startsAt, timezone)}</p>
          <Button
            variant="outline"
            className="w-full rounded-full"
            disabled={cancelling || view.status !== "PENDING" && view.status !== "CONFIRMED"}
            onClick={() => void cancel()}
          >
            {cancelling ? "Annulation…" : "Annuler ce rendez-vous"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
