import { redirect } from "next/navigation";
import { BillingSettingsView } from "@/components/modules/admin";
import { fetchBillingSettingsAction } from "@/components/modules/admin/admin.service";
import { adminFetch } from "@/lib/api-server";
import { ADMIN_ROUTES } from "@/lib/constants";

export default async function AdminBillingSettingsPage() {
  const probe = await adminFetch("/admin/tenants?size=1");
  if (probe.status === 401 || probe.status === 403) {
    redirect(ADMIN_ROUTES.LOGIN);
  }
  const settings = await fetchBillingSettingsAction();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Billing info</h1>
      {settings ? (
        <BillingSettingsView initial={settings} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Impossible de charger les réglages de facturation.
        </p>
      )}
    </div>
  );
}
