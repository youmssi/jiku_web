import { ServiceManageView } from "@/components/modules/services";

export default async function ServiceManagePage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <ServiceManageView serviceId={id} />;
}
