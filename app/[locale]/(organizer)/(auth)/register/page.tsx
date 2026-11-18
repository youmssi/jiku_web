import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localizedPageMetadata } from "@/components/modules/seo";
import { routing, siteLocale } from "@/i18n/routing";
import { ROUTES } from "@/lib/constants";
import { RegisterForm } from "@/components/modules/identity";

interface MetadataProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const requested = (await params).locale;
  const locale = siteLocale(requested);
  const t = await getTranslations({ locale, namespace: "auth.meta.register" });
  // A form, not content: kept out of search results (it is not in the sitemap
  // either) while its links are still followed.
  return {
    ...localizedPageMetadata({
      locale,
      defaultLocale: routing.defaultLocale,
      path: ROUTES.REGISTER,
      title: t("title"),
      description: t("description"),
    }),
    robots: { index: false, follow: true },
  };
}

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function RegisterPage({ searchParams }: Readonly<PageProps>) {
  const { next } = await searchParams;
  return <RegisterForm next={next} />;
}
