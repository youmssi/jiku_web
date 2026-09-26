import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AppointmentStatus, loadAppointment } from "@/components/modules/appointment";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("guest.appointment");
  return { title: t("statusMetaTitle"), robots: { index: false, follow: false } };
}

export default async function ShortLinkStatusPage({
  params,
}: Readonly<{ params: Promise<{ locale: string; code: string; bookingToken: string }> }>) {
  const { code, bookingToken } = await params;
  const view = await loadAppointment({ code });
  return <AppointmentStatus link={{ code }} bookingToken={bookingToken} timezone={view?.timezone ?? "UTC"} />;
}
