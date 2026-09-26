import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AppointmentStatus, WidgetResizer, loadAppointment } from "@/components/modules/appointment";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("guest.appointment");
  return { title: t("statusMetaTitle"), robots: { index: false, follow: false } };
}

/** Following (view or cancel) a booking made from the widget (JIKU-92). */
export default async function WidgetBookingStatusPage({
  params,
}: Readonly<{ params: Promise<{ locale: string; token: string; bookingToken: string }> }>) {
  const { token, bookingToken } = await params;
  const view = await loadAppointment({ token });
  return (
    <div className="min-h-screen bg-background">
      <AppointmentStatus link={{ token }} bookingToken={bookingToken} timezone={view?.timezone ?? "UTC"} />
      <WidgetResizer />
    </div>
  );
}
