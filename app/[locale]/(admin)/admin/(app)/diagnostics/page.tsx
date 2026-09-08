import { redirect } from "next/navigation";
import { DiagnosticsPanel } from "@/components/modules/admin";
import { adminFetch } from "@/lib/api-server";
import { ADMIN_ROUTES } from "@/lib/constants";

export default async function AdminDiagnosticsPage() {
  const probe = await adminFetch("/admin/tenants?size=1");
  if (probe.status === 401 || probe.status === 403) redirect(ADMIN_ROUTES.LOGIN);
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Diagnostics</h1>
      <DiagnosticsPanel />
    </div>
  );
}