import { Building2, InfoIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Membership } from "@/components/modules/identity/schema";
import { useRoleLabel } from "@/components/shared";
import { UsernameForm } from "./username-form";

/**
 * The organization the session is bound to: its name, the caller's role, and
 * the full list of organizations the caller belongs to (name and role per
 * line). Members see only this and their account, because organization
 * settings (branding, messaging providers, invoicing details, personalisation)
 * require the ADMIN or OWNER role. Managers can also set the public username.
 */
export function OrganizationView({
  brandName,
  role,
  isManager,
  username,
  memberships,
}: {
  brandName: string;
  role: string;
  isManager: boolean;
  username: string | null;
  memberships: Membership[];
}) {
  const t = useTranslations("settings.organization");
  const roleLabel = useRoleLabel();
  return (
    <div className="flex flex-col gap-4">
      {!isManager ? (
        <Alert>
          <InfoIcon />
          <AlertTitle>{t("memberRoleTitle", { role: roleLabel(role) })}</AlertTitle>
          <AlertDescription>{t("memberRoleText")}</AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-4" />
            {brandName}
          </CardTitle>
          <CardDescription>{t("current")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between gap-4 py-1">
            <span className="text-muted-foreground">{t("yourRole")}</span>
            <span className="font-medium">{roleLabel(role)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("listTitle")}</CardTitle>
          <CardDescription>{t("listText")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col divide-y text-sm">
            {memberships.map((membership) => (
              <li key={membership.tenantId} className="flex items-center justify-between gap-4 py-2">
                <span className="font-medium">{membership.tenantName}</span>
                <span className="text-muted-foreground">
                  {roleLabel(membership.role)}
                </span>
              </li>
            ))}
            {memberships.length === 0 ? (
              <li className="py-2 text-muted-foreground">{t("listEmpty")}</li>
            ) : null}
          </ul>
        </CardContent>
      </Card>

      {isManager ? <UsernameForm initial={username} /> : null}
    </div>
  );
}
