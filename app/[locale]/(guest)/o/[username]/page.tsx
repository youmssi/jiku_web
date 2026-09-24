import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPublicOrgProfile, OrgPublicView } from "@/components/modules/org-public";

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

/**
 * Route resolution only: reads the username param and resolves the guard
 * (404 for an unknown or suspended organization). Presentation lives in the
 * org-public module, rendered from its barrel.
 */
export default async function PublicOrgPage({
  params,
}: Readonly<{ params: Promise<{ locale: string; username: string }> }>) {
  const { username } = await params;
  const profile = await fetchPublicOrgProfile(username);
  if (!profile) {
    notFound();
  }

  return <OrgPublicView profile={profile} />;
}
