import { getTranslations } from "next-intl/server";
import { AdminPage, ProspectsTable } from "@/components/modules/admin";
import { loadProspects } from "@/components/modules/admin/server";

export default async function AdminProspectsPage() {
  const t = await getTranslations("admin.pages");
  return (
    <AdminPage title={t("prospects")}>
      <ProspectsTable prospects={await loadProspects()} />
    </AdminPage>
  );
}
