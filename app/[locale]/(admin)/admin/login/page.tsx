import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/modules/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { getAdminAccessToken } from "@/lib/auth";
import { ADMIN_ROUTES } from "@/lib/constants";

export const metadata = { title: "Jikū - Administration", robots: { index: false } };

export default async function AdminLoginPage() {
  if (await getAdminAccessToken()) {
    redirect(ADMIN_ROUTES.TENANTS);
  }
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <JikūLogo className="mx-auto mb-2 text-lg" />
          <CardTitle className="text-xl">Jikū administration</CardTitle>
          <CardDescription>
            Platform operators only. All actions are audit-logged.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
