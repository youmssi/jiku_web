import { localeRedirect } from "@/i18n/redirect";
import { OnboardingForm } from "@/components/modules/identity";
import { getOrganizerContext } from "@/components/modules/identity/server";
import { ROUTES } from "@/lib/constants";

/**
 * First-run onboarding (JIKU-52): reachable only signed-in. Accounts that
 * already run an organization can still land here deliberately (the org
 * switcher's "New organization" entry), so there is no away-bounce.
 */
export default async function OnboardingPage() {
  const context = await getOrganizerContext();
  if (!context) {
    return localeRedirect(ROUTES.LOGIN);
  }
  return <OnboardingForm email={context.email} canCancel={Boolean(context.activeTenantId)} />;
}
