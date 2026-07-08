import { InvitationView } from "@/components/modules/invitation";

export default function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  return <InvitationView params={params} />;
}
