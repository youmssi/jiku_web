"use client";

import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRoleLabel } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { ROUTES } from "@/lib/constants";
import { AuthCard } from "@/components/modules/identity/auth-card";
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
    <AuthCard
      title={t("title", { organization: preview.organizationName })}
      description={t("description", { role: roleLabel(preview.role), email: preview.email })}
    >
      <FieldGroup>
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
            <p className="text-center text-sm text-muted-foreground">{t("signInFirst")}</p>
            <Button asChild className="w-full">
              <Link href={`${ROUTES.LOGIN}?next=${encodeURIComponent(next)}`}>{t("signIn")}</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={`${ROUTES.REGISTER}?next=${encodeURIComponent(next)}`}>{t("createAccount")}</Link>
            </Button>
          </>
        )}
      </FieldGroup>
    </AuthCard>
  );
}

/** Shown when the emailed link carries no token or the invitation is gone. */
export function InvalidInvitationView() {
  const t = useTranslations("auth.invitation");
  return (
    <AuthCard title={t("invalidTitle")}>
      <FieldGroup>
        <Alert variant="destructive">
          <AlertDescription>{t("invalid")}</AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="w-full">
          <Link href={ROUTES.HOME}>{t("backToSite")}</Link>
        </Button>
      </FieldGroup>
    </AuthCard>
  );
}
