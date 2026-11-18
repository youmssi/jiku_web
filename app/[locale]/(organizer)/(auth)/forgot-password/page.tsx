import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localizedPageMetadata } from "@/components/modules/seo";
import { routing, siteLocale } from "@/i18n/routing";
import { ROUTES } from "@/lib/constants";
import { ForgotPasswordForm } from "@/components/modules/identity";

interface MetadataProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const requested = (await params).locale;
  const locale = siteLocale(requested);
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
