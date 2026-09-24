import { AcceptInvitationView, InvalidInvitationView } from "@/components/modules/identity";
import type { InvitationPreview } from "@/components/modules/identity";
import { publicFetch } from "@/lib/api-server";
import { getAccessToken } from "@/lib/auth";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

/** The emailed invitation link lands here (JIKU-50). */
export default async function AcceptInvitationPage({ searchParams }: Readonly<PageProps>) {
  const { token } = await searchParams;
  const preview = token ? await loadPreview(token) : null;
  if (!token || !preview) {
    return <InvalidInvitationView />;
  }
  const authenticated = Boolean(await getAccessToken());
  return <AcceptInvitationView token={token} preview={preview} authenticated={authenticated} />;
}

async function loadPreview(token: string): Promise<InvitationPreview | null> {
  const response = await publicFetch(`/auth/invitations/${encodeURIComponent(token)}`);
  return response.ok ? ((await response.json()) as InvitationPreview) : null;
}
