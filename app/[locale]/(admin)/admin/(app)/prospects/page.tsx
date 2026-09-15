import { redirect } from "next/navigation";
import { ProspectsTable } from "@/components/modules/admin";
import type { ProspectLead } from "@/components/modules/admin";
import { adminFetch } from "@/lib/api-server";
import { ADMIN_ROUTES } from "@/lib/constants";

export default async function AdminProspectsPage() {
  const response = await adminFetch("/admin/prospects");
  if (response.status === 401 || response.status === 403) redirect(ADMIN_ROUTES.LOGIN);
  const prospects = response.ok ? ((await response.json()) as ProspectLead[]) : [];
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Prospects</h1>
      <ProspectsTable prospects={prospects} />
    </div>
  );
}
