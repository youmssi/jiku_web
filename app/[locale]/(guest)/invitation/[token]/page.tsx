import { InvitationView } from "@/components/modules/invitation";

export default function InvitationPage({ params }: Readonly<{ params: Promise<{ token: string }> }>) {
  return <InvitationView params={params} />;
}
