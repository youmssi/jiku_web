import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AppointmentBooking } from "@/components/modules/appointment";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("guest.appointment");
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

export default async function AppointmentBookingPage({
  params,
}: Readonly<{ params: Promise<{ locale: string; token: string }> }>) {
  const { token } = await params;
  return <AppointmentBooking link={{ token }} />;
}
