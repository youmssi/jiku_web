import { AdminPage, BillingSettingsView } from "@/components/modules/admin";
import { loadBillingSettings } from "@/components/modules/admin/server";

export default async function AdminBillingSettingsPage() {
  const settings = await loadBillingSettings();
  return (
    <AdminPage title="Billing info">
      {settings ? (
        <BillingSettingsView initial={settings} />
      ) : (
        <p className="text-sm text-muted-foreground">Impossible de charger les réglages de facturation.</p>
      )}
    </AdminPage>
  );
}
