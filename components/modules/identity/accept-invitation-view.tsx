"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { acceptInvitationAction } from "@/components/modules/identity/identity.service";
import type { InvitationPreview } from "@/components/modules/identity/schema";

interface AcceptInvitationViewProps {
  token: string;
  preview: InvitationPreview;
  /** Whether the visitor already has a session; anonymous visitors sign in first. */
  authenticated: boolean;
}

/** The invitee's landing page (JIKU-50): shows what is being joined, then accepts. */
export function AcceptInvitationView({ token, preview, authenticated }: AcceptInvitationViewProps) {
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const next = `${ROUTES.INVITATION_ACCEPT}?token=${encodeURIComponent(token)}`;

  async function accept() {
    setError(null);
    setAccepting(true);
    const result = await acceptInvitationAction(token);
    if (result && !result.ok) {
      setError(result.error);
      setAccepting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Join {preview.organizationName}</CardTitle>
          <CardDescription>
            You&apos;ve been invited as <span className="capitalize">{preview.role.toLowerCase()}</span>,
            with the address {preview.email}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>We couldn&apos;t accept the invitation</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          {authenticated ? (
            <Button className="w-full" onClick={() => void accept()} disabled={accepting}>
              {accepting ? "Joining…" : "Accept invitation"}
            </Button>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Sign in or create an account with the invited address to accept.
              </p>
              <Button asChild className="w-full">
                <Link href={`${ROUTES.LOGIN}?next=${encodeURIComponent(next)}`}>Sign in</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={`${ROUTES.REGISTER}?next=${encodeURIComponent(next)}`}>
                  Create an account
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
