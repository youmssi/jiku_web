"use client";

import { useCallback, useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cancelAppointment, loadBookingStatus, type AppointmentLinkRef } from "@/components/modules/appointment/appointment.service";
import type { AppointmentStatusView } from "@/components/modules/appointment/schema";

/**
 * A client's own booking (JIKU-86): when it is, whether the professional has
 * confirmed it, and a way to cancel it. The time shows in the service's
 * timezone, in the visitor's language.
 */
export function AppointmentStatus({
  link,
  bookingToken,
  timezone,
}: {
  link: AppointmentLinkRef;
  bookingToken: string;
  timezone: string;
}) {
  const t = useTranslations("guest.appointment.status");
  const format = useFormatter();
  const [view, setView] = useState<AppointmentStatusView | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadBookingStatus(link, bookingToken).then((next) => {
      setView(next);
      setLoaded(true);
    });
  }, [link, bookingToken]);

  const cancel = useCallback(async () => {
    setCancelling(true);
    setError(null);
    const result = await cancelAppointment(link, bookingToken);
    setCancelling(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setCancelled(true);
  }, [link, bookingToken]);

  if (cancelled) {
    return <Notice title={t("cancelledTitle")} text={t("cancelledText")} />;
  }
  if (!view) {
    return loaded ? <Notice title={t("notFound")} text={t("notFoundText")} /> : null;
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{view.status === "PENDING" ? t("PENDING") : t("CONFIRMED")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>{t("cancelFailed")}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          {view.clientName ? <p className="font-medium">{view.clientName}</p> : null}
          <p className="text-sm text-muted-foreground">
            {format.dateTime(new Date(view.startsAt), {
              timeZone: timezone,
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <Button variant="outline" className="w-full rounded-full" disabled={cancelling} onClick={() => void cancel()}>
            {cancelling ? t("cancelling") : t("cancel")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Notice({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{text}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
