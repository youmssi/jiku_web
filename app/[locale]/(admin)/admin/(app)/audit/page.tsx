import { AdminPage, AuditView } from "@/components/modules/admin";
import { loadAudit } from "@/components/modules/admin/server";

export default async function AdminAuditPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ action?: string }> }>) {
  const { action } = await searchParams;
  return (
    <AdminPage title="Audit log">
      <AuditView audit={await loadAudit(action)} />
    </AdminPage>
  );
}
