import { ServiceTabs } from "@/components/modules/services";

/** Every page of one service shares its section bar (JIKU-252). */
export default async function ServiceLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return (
    <>
      <div className="mx-auto w-full max-w-4xl px-4 pt-4">
        <ServiceTabs serviceId={id} />
      </div>
      {children}
    </>
  );
}
