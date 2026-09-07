import { ServiceConfigurationView } from "@/components/modules/services";

export default async function ServiceConfigurationPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <ServiceConfigurationView serviceId={id} />;
}
