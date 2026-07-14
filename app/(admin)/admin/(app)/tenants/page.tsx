import { redirect } from "next/navigation";
import { TenantsView } from "@/components/modules/admin";
import type { TenantDirectoryPage } from "@/components/modules/admin";
import { adminFetch } from "@/lib/api-server";
import { ADMIN_ROUTES } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<{ query?: string }>;
}

export default async function AdminTenantsPage({ searchParams }: PageProps) {
  const { query } = await searchParams;
  const params = new URLSearchParams({ size: "50" });
  if (query) params.set("query", query);

  const response = await adminFetch(`/admin/tenants?${params.toString()}`);
  if (response.status === 401 || response.status === 403) {
    redirect(ADMIN_ROUTES.LOGIN);
  }
  const directory = (await response.json()) as TenantDirectoryPage;

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Tenants</h1>
      <TenantsView directory={directory} />
    </div>
  );
}
