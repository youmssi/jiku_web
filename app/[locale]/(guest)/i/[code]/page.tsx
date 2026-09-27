import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OpenInvitationPage } from "@/components/modules/open-invitation";
import { fetchPublicOpenInvitation } from "@/components/modules/open-invitation/server";

type Params = Promise<{ locale: string; code: string }>;

export async function generateMetadata({ params }: Readonly<{ params: Params }>): Promise<Metadata> {
  const { code } = await params;
  const invitation = await fetchPublicOpenInvitation(code);
  if (!invitation) return { robots: { index: false, follow: false } };
  return {
    title: `${invitation.eventName} · ${invitation.organizerName}`,
    description: invitation.welcomeMessage ?? undefined,
    robots: { index: false, follow: false },
    openGraph: { title: invitation.eventName, description: invitation.welcomeMessage ?? invitation.organizerName },
  };
}

/** Route resolution only: an unknown code is a 404. */
export default async function OpenInvitationRoute({ params }: Readonly<{ params: Params }>) {
  const { code } = await params;
  const invitation = await fetchPublicOpenInvitation(code);
  if (!invitation) notFound();
  return <OpenInvitationPage invitation={invitation} />;
}
