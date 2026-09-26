import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AppointmentStatus, loadAppointment } from "@/components/modules/appointment";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("guest.appointment");
  return { title: t("statusMetaTitle"), robots: { index: false, follow: false } };
}

export default async function AppointmentStatusPage({
  params,
}: Readonly<{ params: Promise<{ locale: string; token: string; bookingToken: string }> }>) {
  const { token, bookingToken } = await params;
  const view = await loadAppointment({ token });
  return <AppointmentStatus link={{ token }} bookingToken={bookingToken} timezone={view?.timezone ?? "UTC"} />;
}
