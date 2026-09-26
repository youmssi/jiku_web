import { getTranslations } from "next-intl/server";
import { localeRedirect } from "@/i18n/redirect";
import { AdminLoginForm } from "@/components/modules/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { getAdminAccessToken } from "@/lib/auth";
import { ADMIN_ROUTES } from "@/lib/constants";

export async function generateMetadata() {
  const t = await getTranslations("admin.login");
  return { title: t("metaTitle"), robots: { index: false } };
}

export default async function AdminLoginPage() {
  if (await getAdminAccessToken()) {
    return localeRedirect(ADMIN_ROUTES.TENANTS);
  }
  const t = await getTranslations("admin.login");
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <JikūLogo className="mx-auto mb-2 text-lg" />
          <CardTitle className="text-xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
