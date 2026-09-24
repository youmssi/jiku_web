import { AdminPage, TenantsView } from "@/components/modules/admin";
import { loadTenantDirectory } from "@/components/modules/admin/server";

export default async function AdminTenantsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ query?: string }> }>) {
  const { query } = await searchParams;
  return (
    <AdminPage title="Tenants">
      <TenantsView directory={await loadTenantDirectory(query)} />
    </AdminPage>
  );
}
