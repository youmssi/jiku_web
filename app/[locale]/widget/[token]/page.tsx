import type { Metadata } from "next";
import { AppointmentBooking, WidgetResizer } from "@/components/modules/appointment";

export const metadata: Metadata = {
  title: "Réserver un rendez-vous",
  robots: { index: false, follow: false },
};

/**
 * Page embarrable du widget de réservation (JIKU-92) : le parcours de réservation
 * sans compte, dans une iframe isolée au site du client. La hauteur est envoyée
 * au parent par [WidgetResizer] ; pas d'en-tête ni pied de page — seul le
 * parcours, pour tenir dans le conteneur du client.
 */
export default async function WidgetBookingPage({
  params,
}: Readonly<{ params: Promise<{ locale: string; token: string }> }>) {
  const { token } = await params;
  return (
    <div className="min-h-screen bg-background">
      <AppointmentBooking token={token} />
      <WidgetResizer />
    </div>
  );
}
