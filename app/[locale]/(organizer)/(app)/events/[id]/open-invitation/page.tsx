import { OpenInvitationView } from "@/components/modules/open-invitation/server";

export default async function EventOpenInvitationPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <OpenInvitationView eventId={id} />;
}
