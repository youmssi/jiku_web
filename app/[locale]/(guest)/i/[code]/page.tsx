import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cardSourceOf, OpenInvitationPage } from "@/components/modules/open-invitation";
import { cardMetadata, fetchPublicOpenInvitation } from "@/components/modules/open-invitation/public-server";

type Params = Promise<{ locale: string; code: string }>;
type SearchParams = Promise<{ via?: string | string[] }>;

export async function generateMetadata({ params }: Readonly<{ params: Params }>): Promise<Metadata> {
  const { locale, code } = await params;
  const invitation = await fetchPublicOpenInvitation(code);
  if (!invitation) return { robots: { index: false, follow: false } };
  return cardMetadata(invitation, locale);
}

/** Route resolution only: an unknown code is a 404. */
export default async function OpenInvitationRoute({
  params,
  searchParams,
}: Readonly<{ params: Params; searchParams: SearchParams }>) {
  const [{ code }, { via }] = await Promise.all([params, searchParams]);
  const invitation = await fetchPublicOpenInvitation(code);
  if (!invitation) notFound();
  return <OpenInvitationPage invitation={invitation} source={cardSourceOf(via) ?? null} />;
}
