"use client";

import { useCallback, useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
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
import { OrganizerMark, QrCode } from "@/components/shared";
import { cancelAppointment, loadBookingStatus, type AppointmentLinkRef } from "@/components/modules/appointment/appointment.service";
import type { AppointmentServiceView, AppointmentStatusView } from "@/components/modules/appointment/schema";

/**
 * A client's own booking (JIKU-86, JIKU-249), where booking lands: whether the
 * professional has confirmed it, the code to show at the desk, when and with
 * whom. The page can be reloaded or kept; cancelling stays a quiet link that
 * asks first. Times show in the service's timezone, in the visitor's language.
 */
export function AppointmentStatus({
  link,
  bookingToken,
  service,
}: {
  link: AppointmentLinkRef;
  bookingToken: string;
  service: AppointmentServiceView | null;
}) {
  const t = useTranslations("guest.appointment.status");
  const format = useFormatter();
  const [view, setView] = useState<AppointmentStatusView | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const timeZone = service?.timezone ?? "UTC";
  const names = service?.professionals.join(", ") ?? "";

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
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-5 px-4 py-10 text-center">
      {service?.organizerName ? (
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <OrganizerMark name={service.organizerName} logoUrl={service.logoUrl ?? null} />
          <span>{service.organizerName}</span>
        </div>
      ) : null}
      <div>
        <h1 className="text-xl font-semibold">{view.status === "PENDING" ? t("pendingTitle") : t("confirmedTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{view.status === "PENDING" ? t("PENDING") : t("CONFIRMED")}</p>
      </div>
      {error ? (
        <Alert variant="destructive" className="text-left">
          <AlertTitle>{t("cancelFailed")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="rounded-xl border p-3">
        <QrCode value={bookingToken} className="size-[180px]" />
      </div>
      <div className="flex flex-col gap-0.5">
        {service ? <p className="font-medium">{service.name}</p> : null}
        <p className="first-letter:uppercase">
          {format.dateTime(new Date(view.startsAt), {
            timeZone,
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        {names ? <p className="text-sm text-muted-foreground">{t("withNames", { names })}</p> : null}
        <p className="mt-2 text-xs text-muted-foreground">{t("number", { number: bookingToken.slice(0, 8) })}</p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="link" className="text-muted-foreground" disabled={cancelling}>
            {cancelling ? t("cancelling") : t("cancel")}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancelTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("cancelDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("keep")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void cancel()}>{t("cancelConfirm")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Notice({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-2 px-4 py-12 text-center">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
