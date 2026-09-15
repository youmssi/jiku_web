import type { Metadata } from "next";
import { AppointmentBooking } from "@/components/modules/appointment";

export const metadata: Metadata = {
  title: "Réserver un rendez-vous",
  robots: { index: false, follow: false },
};

export default async function ShortLinkBookingPage({
  params,
}: Readonly<{ params: Promise<{ locale: string; code: string }> }>) {
  const { code } = await params;
  return <AppointmentBooking link={{ code }} />;
}
