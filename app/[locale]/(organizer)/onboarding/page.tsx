import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/modules/identity";
import { getOrganizerContext } from "@/components/modules/identity/organizer-context";
import { ROUTES } from "@/lib/constants";

/**
 * First-run onboarding (JIKU-52): reachable only signed-in. Accounts that
 * already run an organization can still land here deliberately (the org
 * switcher's "New organization" entry), so there is no away-bounce.
 */
export default async function OnboardingPage() {
  const context = await getOrganizerContext();
  if (!context) {
    redirect(ROUTES.LOGIN);
  }
  return <OnboardingForm email={context.email} />;
}
