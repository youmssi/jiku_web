import type { Metadata } from "next";
import { AppointmentStatus, WidgetResizer } from "@/components/modules/appointment";
import { loadAppointment } from "@/components/modules/appointment/appointment.service";

export const metadata: Metadata = {
  title: "Mon rendez-vous",
  robots: { index: false, follow: false },
};

/** Suivi (voir/annuler) d'une réservation faite depuis le widget (JIKU-92). */
export default async function WidgetBookingStatusPage({
  params,
}: Readonly<{ params: Promise<{ locale: string; token: string; bookingToken: string }> }>) {
  const { token, bookingToken } = await params;
  const view = await loadAppointment(token);
  return (
    <div className="min-h-screen bg-background">
      <AppointmentStatus token={token} bookingToken={bookingToken} timezone={view?.timezone ?? "UTC"} />
      <WidgetResizer />
    </div>
  );
}
