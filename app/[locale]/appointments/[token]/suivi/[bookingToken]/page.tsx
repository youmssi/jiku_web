import type { Metadata } from "next";
import { AppointmentStatus } from "@/components/modules/appointment";
import { loadAppointment } from "@/components/modules/appointment/appointment.service";

export const metadata: Metadata = {
  title: "Mon rendez-vous",
  robots: { index: false, follow: false },
};

export default async function AppointmentStatusPage({
  params,
}: Readonly<{ params: Promise<{ locale: string; token: string; bookingToken: string }> }>) {
  const { token, bookingToken } = await params;
  const view = await loadAppointment(token);
  return <AppointmentStatus token={token} bookingToken={bookingToken} timezone={view?.timezone ?? "UTC"} />;
}
