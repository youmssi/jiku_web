import { getTranslations } from "next-intl/server";
import { AdminPage, DiagnosticsPanel } from "@/components/modules/admin";
import { requireAdminSession } from "@/components/modules/admin/server";

export default async function AdminDiagnosticsPage() {
  const t = await getTranslations("admin.pages");
  await requireAdminSession();
  return (
    <AdminPage title={t("diagnostics")}>
      <DiagnosticsPanel />
    </AdminPage>
  );
}
