import { redirect } from "next/navigation";
import { TrialsView } from "@/components/modules/admin";
import type { AdminTierCatalog, AdminTrial } from "@/components/modules/admin";
import { adminFetch } from "@/lib/api-server";
import { ADMIN_ROUTES } from "@/lib/constants";

export default async function AdminTrialsPage() {
  const [response, catalogResponse] = await Promise.all([
    adminFetch("/admin/trials?size=50"),
    adminFetch("/admin/billing/tiers"),
  ]);
  if (response.status === 401 || response.status === 403) {
    redirect(ADMIN_ROUTES.LOGIN);
  }
  const trials = (await response.json()) as AdminTrial[];
  const catalog = (await catalogResponse.json()) as AdminTierCatalog;

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Trials</h1>
      <TrialsView trials={trials} catalog={catalog} />
    </div>
  );
}
