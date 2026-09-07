import type { Metadata } from "next";
import { AppointmentBooking } from "@/components/modules/appointment";

export const metadata: Metadata = {
  title: "Réserver un rendez-vous",
  robots: { index: false, follow: false },
};

export default async function AppointmentBookingPage({
  params,
}: Readonly<{ params: Promise<{ locale: string; token: string }> }>) {
  const { token } = await params;
  return <AppointmentBooking token={token} />;
}
