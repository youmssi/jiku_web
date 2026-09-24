import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localeRedirect } from "@/i18n/redirect";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { organizerRole } from "@/components/shared/organizer-nav";
import { getOrganizerContext } from "@/components/modules/identity/organizer-context";

/** Signed-in organizer landing screen. */
export async function OrganizerHome() {
  const context = await getOrganizerContext();
  if (!context) {
    return localeRedirect(ROUTES.LOGIN);
  }
  const t = await getTranslations();
  const role = organizerRole(context.role);

  const sections = [
    { title: t("shell.home.eventsTitle"), description: t("shell.home.eventsDescription"), cta: t("shell.home.eventsCta"), href: ROUTES.EVENTS },
    { title: t("shell.home.servicesTitle"), description: t("shell.home.servicesDescription"), cta: t("shell.home.servicesCta"), href: ROUTES.SERVICES },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <div>
        <h1 className="text-2xl font-semibold">{t("shell.home.welcome", { name: context.fullName ?? context.email })}</h1>
        <p className="text-sm text-muted-foreground">
          {t("shell.home.signedInAs", {
            role: role ? t(`common.roles.${role}`) : context.role,
            organization: context.brandName,
          })}
        </p>
      </div>
      <p className="mt-4 rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
        {t.rich("shell.home.help", { strong: (chunks) => <strong>{chunks}</strong> })}
      </p>
      {sections.map((section) => (
        <div key={section.href} className="mt-4 flex flex-col items-start gap-4 rounded-lg border p-8 first-of-type:mt-8">
          <div>
            <h2 className="text-lg font-medium">{section.title}</h2>
            <p className="text-sm text-muted-foreground">{section.description}</p>
          </div>
          <Button asChild>
            <Link href={section.href}>{section.cta}</Link>
          </Button>
        </div>
      ))}
    </div>
  );
}
