import { redirect } from "next/navigation";
import { TrialsView } from "@/components/modules/admin";
import type { AdminTierCatalog, AdminTrial } from "@/components/modules/admin";
import { adminFetch } from "@/lib/api-server";
import { ADMIN_ROUTES } from "@/lib/constants";

const EMPTY_CATALOG: AdminTierCatalog = { currency: "", tiers: [] };

export default async function AdminTrialsPage() {
  const [response, catalogResponse] = await Promise.all([
    adminFetch("/admin/trials?size=50"),
    adminFetch("/admin/billing/tiers"),
  ]);
  if (response.status === 401 || response.status === 403) {
    redirect(ADMIN_ROUTES.LOGIN);
  }
  const trials = response.ok ? ((await response.json()) as AdminTrial[]) : [];
  const catalog = catalogResponse.ok
    ? ((await catalogResponse.json()) as AdminTierCatalog)
    : EMPTY_CATALOG;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Trials</h1>
      <TrialsView trials={trials} catalog={catalog} />
    </div>
  );
}
