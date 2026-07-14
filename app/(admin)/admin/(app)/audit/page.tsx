import { redirect } from "next/navigation";
import { AuditView } from "@/components/modules/admin";
import type { AuditPage } from "@/components/modules/admin";
import { adminFetch } from "@/lib/api-server";
import { ADMIN_ROUTES } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<{ action?: string }>;
}

export default async function AdminAuditPage({ searchParams }: Readonly<PageProps>) {
  const { action } = await searchParams;
  const params = new URLSearchParams({ size: "100" });
  if (action) params.set("action", action);

  const response = await adminFetch(`/admin/audit?${params.toString()}`);
  if (response.status === 401 || response.status === 403) {
    redirect(ADMIN_ROUTES.LOGIN);
  }
  const audit = (await response.json()) as AuditPage;

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Audit log</h1>
      <AuditView audit={audit} />
    </div>
  );
}
