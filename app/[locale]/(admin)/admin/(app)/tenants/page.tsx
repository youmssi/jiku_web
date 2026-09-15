import { redirect } from "next/navigation";
import { TenantsView } from "@/components/modules/admin";
import type { TenantDirectoryPage } from "@/components/modules/admin";
import { adminFetch } from "@/lib/api-server";
import { ADMIN_ROUTES } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<{ query?: string }>;
}

const EMPTY_DIRECTORY: TenantDirectoryPage = {
  entries: [],
  total: 0,
  page: 0,
  size: 50,
};

export default async function AdminTenantsPage({ searchParams }: Readonly<PageProps>) {
  const { query } = await searchParams;
  const params = new URLSearchParams({ size: "50" });
  if (query) params.set("query", query);

  const response = await adminFetch(`/admin/tenants?${params.toString()}`);
  if (response.status === 401 || response.status === 403) {
    redirect(ADMIN_ROUTES.LOGIN);
  }
  const directory = response.ok
    ? ((await response.json()) as TenantDirectoryPage)
    : EMPTY_DIRECTORY;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Tenants</h1>
      <TenantsView directory={directory} />
    </div>
  );
}
