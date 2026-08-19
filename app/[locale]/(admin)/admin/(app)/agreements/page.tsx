import { redirect } from "next/navigation";
import { AgreementsView } from "@/components/modules/admin";
import type { AdminAgreement, AdminTierCatalog } from "@/components/modules/admin";
import { adminFetch } from "@/lib/api-server";
import { ADMIN_ROUTES } from "@/lib/constants";

export default async function AdminAgreementsPage() {
  const [response, catalogResponse] = await Promise.all([
    adminFetch("/admin/agreements?size=50"),
    adminFetch("/admin/billing/tiers"),
  ]);
  if (response.status === 401 || response.status === 403) {
    redirect(ADMIN_ROUTES.LOGIN);
  }
  const agreements = (await response.json()) as AdminAgreement[];
  const catalog = (await catalogResponse.json()) as AdminTierCatalog;

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Enterprise agreements</h1>
      <AgreementsView agreements={agreements} catalog={catalog} />
    </div>
  );
}
