import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { guestRouting } from "@/i18n/routing";
import { AppointmentBooking } from "@/components/modules/appointment";
import { serviceCardMetadata } from "@/components/modules/appointment/server";

export async function generateMetadata({
  params,
}: Readonly<{ params: Promise<{ locale: string; code: string }> }>): Promise<Metadata> {
  const { locale, code } = await params;
  const t = await getTranslations("guest.appointment");
  const robots = { index: false, follow: false };
  const card = /^[A-Za-z0-9]{4,16}$/.test(code) && hasLocale(guestRouting.locales, locale) ? await serviceCardMetadata(code, locale) : null;
  if (!card) return { title: t("metaTitle"), robots };
  const images = [{ url: card.image, width: 1200, height: 630, alt: card.title }];
  return {
    title: card.title,
    description: card.description,
    robots,
    openGraph: { title: card.title, description: card.description, images },
    twitter: { card: "summary_large_image", title: card.title, description: card.description, images: [card.image] },
  };
}

export default async function ShortLinkBookingPage({
  params,
}: Readonly<{ params: Promise<{ locale: string; code: string }> }>) {
  const { code } = await params;
  return <AppointmentBooking link={{ code }} />;
}
