import { getTranslations } from "next-intl/server";
import { AdminPage, TenantsView } from "@/components/modules/admin";
import { loadTenantDirectory } from "@/components/modules/admin/server";

export default async function AdminTenantsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ query?: string }> }>) {
  const t = await getTranslations("admin.pages");
  const { query } = await searchParams;
  return (
    <AdminPage title={t("tenants")}>
      <TenantsView directory={await loadTenantDirectory(query)} />
    </AdminPage>
  );
}
