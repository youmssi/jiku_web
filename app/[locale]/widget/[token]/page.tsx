import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AppointmentBooking, WidgetResizer } from "@/components/modules/appointment";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("guest.appointment");
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

/**
 * The embeddable booking widget (JIKU-92): the no-account booking flow in an
 * iframe on the organization's own site. [WidgetResizer] sends the height to the
 * parent page; no header or footer, only the flow, to fit the host's container.
 */
export default async function WidgetBookingPage({
  params,
}: Readonly<{ params: Promise<{ locale: string; token: string }> }>) {
  const { token } = await params;
  return (
    <div className="min-h-screen bg-background">
      <AppointmentBooking link={{ token }} />
      <WidgetResizer />
    </div>
  );
}
