import { InvitationView } from "@/components/modules/invitation";

// Guest names, event details and RSVP status must never be indexed (JIKU-58).
export const metadata = { robots: { index: false, follow: false, nocache: true } };

export default function InvitationPage({ params }: Readonly<{ params: Promise<{ token: string }> }>) {
  return <InvitationView params={params} />;
}
