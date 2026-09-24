import { AdminPage, DiagnosticsPanel } from "@/components/modules/admin";
import { requireAdminSession } from "@/components/modules/admin/server";

export default async function AdminDiagnosticsPage() {
  await requireAdminSession();
  return (
    <AdminPage title="Diagnostics">
      <DiagnosticsPanel />
    </AdminPage>
  );
}
