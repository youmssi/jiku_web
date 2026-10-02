import { UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRoleLabel } from "@/components/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MarketingConsentSwitch } from "@/components/modules/settings/marketing-consent-switch";

/**
 * The signed-in user's own identity, read-only (the backend has no profile
 * update endpoint yet), and the one preference they control: Jikū's news and
 * tips (JIKU-201).
 */
export function AccountView({
  fullName,
  email,
  role,
  marketingConsent,
}: {
  fullName: string | null;
  email: string;
  role: string;
  marketingConsent: boolean;
}) {
  const t = useTranslations("settings.account");
  const roleLabel = useRoleLabel();
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-4" />
            {t("title")}
          </CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between gap-4 py-1">
            <span className="text-muted-foreground">{t("name")}</span>
            <span className="font-medium">{fullName ?? t("notSet")}</span>
          </div>
          <div className="flex justify-between gap-4 py-1">
            <span className="text-muted-foreground">{t("email")}</span>
            <span className="font-medium">{email}</span>
          </div>
          <div className="flex justify-between gap-4 py-1">
            <span className="text-muted-foreground">{t("role")}</span>
            <span className="font-medium">{roleLabel(role)}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <MarketingConsentSwitch initial={marketingConsent} />
        </CardContent>
      </Card>
    </div>
  );
}
