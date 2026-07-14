"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { verifyEmailAction } from "@/components/modules/identity/identity.service";

type State = { status: "verifying" } | { status: "done" } | { status: "failed"; error: string };

/** Consumes the emailed verification token as soon as the page opens (JIKU-49). */
export function VerifyEmailView({ token }: { token: string | null }) {
  const [state, setState] = useState<State>(
    token ? { status: "verifying" } : { status: "failed", error: "This link is incomplete." },
  );

  useEffect(() => {
    if (!token) {
      return;
    }
    void verifyEmailAction(token).then((result) => {
      setState(result.ok ? { status: "done" } : { status: "failed", error: result.error });
    });
  }, [token]);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Email verification</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {state.status === "verifying" ? (
            <p className="text-sm text-muted-foreground">Confirming your address…</p>
          ) : state.status === "done" ? (
            <>
              <Alert>
                <AlertTitle>Your email is verified</AlertTitle>
                <AlertDescription>
                  You&apos;re all set — continue to your account to create your organization.
                </AlertDescription>
              </Alert>
              <Button asChild className="w-full">
                <Link href={ROUTES.ONBOARDING}>Continue</Link>
              </Button>
            </>
          ) : (
            <>
              <Alert variant="destructive">
                <AlertTitle>We couldn&apos;t verify this link</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
              <Button asChild variant="outline" className="w-full">
                <Link href={ROUTES.LOGIN}>Go to sign in</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
