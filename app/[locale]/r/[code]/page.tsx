import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AppointmentBooking } from "@/components/modules/appointment";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("guest.appointment");
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

export default async function ShortLinkBookingPage({
  params,
}: Readonly<{ params: Promise<{ locale: string; code: string }> }>) {
  const { code } = await params;
  return <AppointmentBooking link={{ code }} />;
}
