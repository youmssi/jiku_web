import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localizedPageMetadata } from "@/components/modules/seo";
import { routing, siteLocale } from "@/i18n/routing";
import { ROUTES } from "@/lib/constants";
import { LoginForm } from "@/components/modules/identity";

interface MetadataProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const requested = (await params).locale;
  const locale = siteLocale(requested);
  const t = await getTranslations({ locale, namespace: "auth.meta.login" });
  return localizedPageMetadata({
    locale,
    defaultLocale: routing.defaultLocale,
    path: ROUTES.LOGIN,
    title: t("title"),
    description: t("description"),
    index: false,
  });
}

interface PageProps {
  searchParams: Promise<{ next?: string; deletion?: string; step?: string }>;
}

export default async function LoginPage({ searchParams }: Readonly<PageProps>) {
  const { next, deletion, step } = await searchParams;
  return <LoginForm next={next} deletionScheduled={deletion === "scheduled"} codeStepFirst={step === "code"} />;
}
