import { ServiceShareView } from "@/components/modules/services";

export default async function ServiceSharePage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <ServiceShareView serviceId={id} />;
}
