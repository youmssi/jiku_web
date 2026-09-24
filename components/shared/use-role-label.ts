import { useTranslations } from "next-intl";

import { organizerRole } from "@/components/shared/organizer-nav";

/** Translates a backend role (`ORGANIZER_OWNER`, `OWNER`, …) into its display name. */
export function useRoleLabel(): (role: string) => string {
  const t = useTranslations("common.roles");
  return (role) => {
    const key = organizerRole(role);
    return key ? t(key) : role;
  };
}
