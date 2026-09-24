"use client";

import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRoleLabel } from "@/components/shared";
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
  const t = useTranslations("auth.invitation");
  const roleLabel = useRoleLabel();
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
          <CardTitle className="text-2xl">{t("title", { organization: preview.organizationName })}</CardTitle>
          <CardDescription>
            {t("description", { role: roleLabel(preview.role), email: preview.email })}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>{t("failed")}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          {authenticated ? (
            <Button className="w-full" onClick={() => void accept()} disabled={accepting}>
              {accepting ? t("accepting") : t("accept")}
            </Button>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{t("signInFirst")}</p>
              <Button asChild className="w-full">
                <Link href={`${ROUTES.LOGIN}?next=${encodeURIComponent(next)}`}>{t("signIn")}</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={`${ROUTES.REGISTER}?next=${encodeURIComponent(next)}`}>{t("createAccount")}</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
