import { redirect } from "next/navigation";
import { TrialsView } from "@/components/modules/admin";
import type { AdminTrial } from "@/components/modules/admin";
import { adminFetch } from "@/lib/api-server";
import { ADMIN_ROUTES } from "@/lib/constants";

export default async function AdminTrialsPage() {
  const response = await adminFetch("/admin/trials?size=50");
  if (response.status === 401 || response.status === 403) {
    redirect(ADMIN_ROUTES.LOGIN);
  }
  const trials = (await response.json()) as AdminTrial[];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Trials</h1>
      <TrialsView trials={trials} />
    </div>
  );
}
