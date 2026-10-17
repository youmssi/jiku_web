import "server-only";

import { getTranslations } from "next-intl/server";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getOrganizerContext } from "@/components/modules/identity/server";
import { MembersView, fetchMembersAction } from "@/components/modules/members";
import { SalesSettingsForm } from "@/components/modules/sale";
import { loadSalesSettings } from "@/components/modules/sale/server";
import { VerificationView } from "@/components/modules/verification";
import { loadVerification } from "@/components/modules/verification/server";
import { loadSmsAvailable } from "@/lib/sms-available";
import { AccountView } from "@/components/modules/settings/account-view";
import { BrandingView } from "@/components/modules/settings/branding-view";
import { LegalIdentityView } from "@/components/modules/settings/legal-identity-view";
import { PaymentMethodsForm } from "@/components/modules/settings/payment-methods-form";
import { OrganizationView } from "@/components/modules/settings/organization-view";
import { PersonalisationView } from "@/components/modules/settings/personalisation-view";
import { ProviderSettingsView } from "@/components/modules/settings/provider-settings-view";
import {
  loadBranding,
  loadLegalIdentity,
  loadOrgUsername,
  loadProviderSettings,
  loadEmbeddedSignupConfig,
  loadPaymentMethods,
  loadTemplates,
  loadVocabulary,
} from "@/components/modules/settings/settings.queries";
import type {
  BrandingResponse,
  LegalIdentityResponse,
  ProviderSettingsResponse,
} from "@/components/modules/settings/schema";

const MANAGER_ROLES = ["ORGANIZER_OWNER", "ORGANIZER_ADMIN"];

function defaultBranding(displayName: string): BrandingResponse {
  return { displayName, logoUrl: null, bannerUrl: null, primaryColor: "#2563EB" };
}

const UNCONFIGURED_PROVIDERS: ProviderSettingsResponse = {
  email: { configured: false, provider: null, from: null, fromName: null, apiKeyMasked: null },
  whatsapp: {
    configured: false,
    provider: null,
    phoneNumberId: null,
    accessTokenMasked: null,
    templateName: null,
    templateLanguage: null,
    allowed: false,
    displayPhoneNumber: null,
    verifiedName: null,
  },
};

const EMPTY_LEGAL_IDENTITY: LegalIdentityResponse = {
  legalName: null,
  registrationNumber: null,
  taxIdentifier: null,
  addressLine: null,
  city: null,
  country: null,
  completeForInvoicing: false,
};

/**
 * Everything a manager edits about their organization, loaded in one parallel
 * round. A section whose load fails opens on its empty state rather than
 * blocking the others.
 */
async function loadManagerSettings(fallbackOrganization: string) {
  const [username, branding, providers, embeddedSignup, paymentMethods, legalIdentity, members, vocabulary, templates, verification, sales, smsAvailable] =
    await Promise.all([
    loadOrgUsername(),
    loadBranding(),
    loadProviderSettings(),
    loadEmbeddedSignupConfig(),
    loadPaymentMethods(),
    loadLegalIdentity(),
    fetchMembersAction(),
    loadVocabulary(),
    loadTemplates(),
    loadVerification(),
    loadSalesSettings(),
    loadSmsAvailable(),
  ]);
  return {
    username,
    branding: branding ?? defaultBranding(fallbackOrganization),
    providers: providers ?? UNCONFIGURED_PROVIDERS,
    embeddedSignup: embeddedSignup ?? { enabled: false, appId: null, configId: null, graphVersion: null },
    paymentMethods,
    legalIdentity: legalIdentity ?? EMPTY_LEGAL_IDENTITY,
    team: members.ok ? members.data : null,
    vocabulary,
    templates,
    verification,
    sales,
    smsAvailable,
  };
}

/** The settings sections in the order and groups the index lists them. */
const SECTION_GROUPS = [
  { id: "organization", sections: ["organization", "branding", "members"] },
  { id: "payments", sections: ["verification", "payments", "sales", "legal"] },
  { id: "messages", sections: ["messaging", "personalisation"] },
  { id: "account", sections: ["account"] },
] as const;

type Section = (typeof SECTION_GROUPS)[number]["sections"][number];

const MEMBER_SECTIONS: readonly Section[] = ["organization", "account"];

/**
 * The organizer's settings: organization, branding, team, payments, messaging
 * and account. A grouped index replaces a strip of ten tabs: on a phone it is
 * the first screen and each section opens on its own with a way back; from a
 * tablet up it stays beside the open section. `?tab=` names the open section.
 * Organization-scoped sections need the ADMIN or OWNER role; a member only sees
 * their organization and account, and nothing a member cannot read is fetched.
 */
export async function SettingsView({ tab }: { tab?: string }) {
  const context = await getOrganizerContext();
  const isManager = context !== null && MANAGER_ROLES.includes(context.role);
  const [tPage, tSales] = await Promise.all([getTranslations("settings.page"), getTranslations("settings.sales")]);
  const settings = isManager ? await loadManagerSettings(tPage("fallbackOrganization")) : null;

  const available = (section: Section) =>
    settings ? section !== "members" || settings.team !== null : MEMBER_SECTIONS.includes(section);
  const groups = SECTION_GROUPS.map((group) => ({ id: group.id, sections: group.sections.filter(available) })).filter(
    (group) => group.sections.length > 0,
  );
  const opened = groups.some((group) => group.sections.some((section) => section === tab)) ? (tab as Section) : null;
  const shown: Section = opened ?? "organization";
  const label = (section: Section) =>
    section === "verification" ? tPage("tabs.verification") : section === "sales" ? tSales("tab") : tPage(`tabs.${section}`);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <div className={cn("mb-6 md:mb-8", opened && "max-md:hidden")}>
        <h1 className="text-2xl font-bold tracking-tight">{tPage("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{tPage("description")}</p>
      </div>

      <div className="md:grid md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10">
        <nav aria-label={tPage("title")} className={cn("flex flex-col gap-6 md:gap-4", opened && "max-md:hidden")}>
          {groups.map((group) => (
            <div key={group.id} className="flex flex-col gap-1">
              <h2 className="px-3 text-xs font-medium text-muted-foreground">{tPage(`groups.${group.id}`)}</h2>
              <ul className="flex flex-col overflow-hidden rounded-xl border md:rounded-none md:border-0">
                {group.sections.map((section) => {
                  const current = section === shown;
                  return (
                    <li key={section} className="border-b last:border-b-0 md:border-0">
                      <Link
                        href={`${ROUTES.SETTINGS}?tab=${section}`}
                        aria-current={current ? "page" : undefined}
                        className={cn(
                          "flex min-h-12 items-center justify-between gap-3 px-3 text-sm font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring md:min-h-9 md:rounded-md",
                          current && "md:bg-muted",
                        )}
                      >
                        {label(section)}
                        <ChevronRight className="size-4 text-muted-foreground md:hidden" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <section className={cn("min-w-0", !opened && "max-md:hidden")}>
          {opened ? (
            <div className="mb-6 md:hidden">
              <Link
                href={ROUTES.SETTINGS}
                className="-ml-3 inline-flex min-h-11 items-center gap-1 rounded-md px-3 text-sm text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="size-4" aria-hidden />
                {tPage("title")}
              </Link>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">{label(opened)}</h1>
            </div>
          ) : null}
          {renderSection(shown)}
        </section>
      </div>
    </div>
  );

  function renderSection(section: Section) {
    switch (section) {
      case "organization":
        return (
          <OrganizationView
            brandName={context?.brandName ?? tPage("fallbackOrganization")}
            role={context?.role ?? ""}
            isManager={isManager}
            username={settings?.username ?? null}
            memberships={context?.memberships ?? []}
          />
        );
      case "account":
        return (
          <AccountView
            fullName={context?.fullName ?? null}
            email={context?.email ?? ""}
            role={context?.role ?? ""}
            marketingConsent={context?.marketingConsent ?? false}
          />
        );
    }
    if (!settings) return null;
    switch (section) {
      case "branding":
        return <BrandingView branding={settings.branding} />;
      case "members":
        return settings.team ? (
          <MembersView
            members={settings.team.members}
            invitations={settings.team.invitations}
            currentUserId={context?.userId ?? ""}
          />
        ) : null;
      case "messaging":
        return <ProviderSettingsView initial={settings.providers} embeddedSignup={settings.embeddedSignup} />;
      case "verification":
        return <VerificationView overview={settings.verification} smsAvailable={settings.smsAvailable} />;
      case "payments":
        return <PaymentMethodsForm initial={settings.paymentMethods} />;
      case "sales":
        return <SalesSettingsForm initial={settings.sales} />;
      case "legal":
        return <LegalIdentityView identity={settings.legalIdentity} />;
      case "personalisation":
        return <PersonalisationView initialVocabulary={settings.vocabulary} templateSummaries={settings.templates} />;
    }
  }
}
