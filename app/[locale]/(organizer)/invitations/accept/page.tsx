import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AcceptInvitationView } from "@/components/modules/identity";
import type { InvitationPreview } from "@/components/modules/identity";
import { publicFetch } from "@/lib/api-server";
import { getAccessToken } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

/** The emailed invitation link lands here (JIKU-50). */
export default async function AcceptInvitationPage({ searchParams }: Readonly<PageProps>) {
  const { token } = await searchParams;
  const preview = token ? await loadPreview(token) : null;

  if (!token || !preview) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Invitation</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Alert variant="destructive">
              <AlertTitle>This invitation is invalid or has expired</AlertTitle>
              <AlertDescription>
                Ask the person who invited you to send a fresh invitation.
              </AlertDescription>
            </Alert>
            <Button asChild variant="outline" className="w-full">
              <Link href={ROUTES.HOME}>Back to the site</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const authenticated = Boolean(await getAccessToken());
  return <AcceptInvitationView token={token} preview={preview} authenticated={authenticated} />;
}

async function loadPreview(token: string): Promise<InvitationPreview | null> {
  const response = await publicFetch(`/auth/invitations/${encodeURIComponent(token)}`);
  return response.ok ? ((await response.json()) as InvitationPreview) : null;
}
