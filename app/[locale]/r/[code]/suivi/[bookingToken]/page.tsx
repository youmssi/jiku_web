import type { Metadata } from "next";
import { AppointmentStatus } from "@/components/modules/appointment";
import { loadAppointment } from "@/components/modules/appointment/appointment.service";

export const metadata: Metadata = {
  title: "Mon rendez-vous",
  robots: { index: false, follow: false },
};

export default async function ShortLinkStatusPage({
  params,
}: Readonly<{ params: Promise<{ locale: string; code: string; bookingToken: string }> }>) {
  const { code, bookingToken } = await params;
  const view = await loadAppointment({ code });
  return <AppointmentStatus link={{ code }} bookingToken={bookingToken} timezone={view?.timezone ?? "UTC"} />;
}
