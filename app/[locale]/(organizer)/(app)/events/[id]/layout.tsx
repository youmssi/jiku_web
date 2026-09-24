import { EventWorkspace } from "@/components/modules/event/server";

export default async function EventLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <EventWorkspace eventId={id}>{children}</EventWorkspace>;
}
