import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { localizedPageMetadata } from "@/components/modules/seo";
import { routing } from "@/i18n/routing";
import { ROUTES } from "@/lib/constants";
import { ForgotPasswordForm } from "@/components/modules/identity";

interface MetadataProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const requested = (await params).locale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "auth.meta.forgotPassword" });
  return localizedPageMetadata({
    locale,
    defaultLocale: routing.defaultLocale,
    path: ROUTES.FORGOT_PASSWORD,
    title: t("title"),
    description: t("description"),
    index: false,
  });
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
