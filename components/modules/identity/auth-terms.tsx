"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FieldDescription } from "@/components/ui/field";
import { PRIVACY_ROUTE } from "@/lib/constants";

/** The consent note under the sign-in and sign-up cards. */
export function AuthTerms() {
  const t = useTranslations("auth");
  return (
    <FieldDescription className="px-6 text-center">
      {t.rich("terms", { privacy: (chunks) => <Link href={PRIVACY_ROUTE}>{chunks}</Link> })}
    </FieldDescription>
  );
}
