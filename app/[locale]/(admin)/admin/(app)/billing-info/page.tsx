import { getTranslations } from "next-intl/server";
import { AdminPage, BillingSettingsView } from "@/components/modules/admin";
import { loadBillingSettings } from "@/components/modules/admin/server";

export default async function AdminBillingSettingsPage() {
  const t = await getTranslations("admin.pages");
  const settings = await loadBillingSettings();
  return (
    <AdminPage title={t("billingInfo")}>
      {settings ? (
        <BillingSettingsView initial={settings} />
      ) : (
        <p className="text-sm text-muted-foreground">{t("billingLoadFailed")}</p>
      )}
    </AdminPage>
  );
}
