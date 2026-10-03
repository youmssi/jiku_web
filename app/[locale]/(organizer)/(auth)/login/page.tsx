import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { localizedPageMetadata } from "@/components/modules/seo";
import { routing } from "@/i18n/routing";
import { ROUTES } from "@/lib/constants";
import { LoginForm } from "@/components/modules/identity";

interface MetadataProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const requested = (await params).locale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
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
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: Readonly<PageProps>) {
  const { next } = await searchParams;
  return <LoginForm next={next} />;
}
