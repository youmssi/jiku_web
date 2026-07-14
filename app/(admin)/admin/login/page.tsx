import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/modules/admin";
import { getAdminAccessToken } from "@/lib/auth";
import { ADMIN_ROUTES } from "@/lib/constants";

export const metadata = { title: "Jikū — Administration", robots: { index: false } };

export default async function AdminLoginPage() {
  if (await getAdminAccessToken()) {
    redirect(ADMIN_ROUTES.TENANTS);
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Jikū administration</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform operators only. All actions are audit-logged.
        </p>
      </div>
      <AdminLoginForm />
    </main>
  );
}
