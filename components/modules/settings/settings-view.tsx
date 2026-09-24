import "server-only";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOrganizerContext } from "@/components/modules/identity/server";
import { MembersView, fetchMembersAction } from "@/components/modules/members";
import { AccountView } from "@/components/modules/settings/account-view";
import { BrandingView } from "@/components/modules/settings/branding-view";
import { LegalIdentityView } from "@/components/modules/settings/legal-identity-view";
import { OrganizationView } from "@/components/modules/settings/organization-view";
import { PersonalisationView } from "@/components/modules/settings/personalisation-view";
import { ProviderSettingsView } from "@/components/modules/settings/provider-settings-view";
import {
  loadBranding,
  loadLegalIdentity,
  loadOrgUsername,
  loadProviderSettings,
  loadTemplates,
  loadVocabulary,
} from "@/components/modules/settings/settings.queries";
import type {
  BrandingResponse,
  LegalIdentityResponse,
  ProviderSettingsResponse,
} from "@/components/modules/settings/schema";

const MANAGER_ROLES = ["ORGANIZER_OWNER", "ORGANIZER_ADMIN"];

const DEFAULT_BRANDING: BrandingResponse = {
  displayName: "Your organization",
  logoUrl: null,
  bannerUrl: null,
  primaryColor: "#2563EB",
};

const UNCONFIGURED_PROVIDERS: ProviderSettingsResponse = {
  email: { configured: false, provider: null, from: null, fromName: null, apiKeyMasked: null },
  whatsapp: {
    configured: false,
    provider: null,
    phoneNumberId: null,
    accessTokenMasked: null,
    templateName: null,
    templateLanguage: null,
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
async function loadManagerSettings() {
  const [username, branding, providers, legalIdentity, members, vocabulary, templates] = await Promise.all([
    loadOrgUsername(),
    loadBranding(),
    loadProviderSettings(),
    loadLegalIdentity(),
    fetchMembersAction(),
    loadVocabulary(),
    loadTemplates(),
  ]);
  return {
    username,
    branding: branding ?? DEFAULT_BRANDING,
    providers: providers ?? UNCONFIGURED_PROVIDERS,
    legalIdentity: legalIdentity ?? EMPTY_LEGAL_IDENTITY,
    team: members.ok ? members.data : null,
    vocabulary,
    templates,
  };
}

/**
 * The organizer's settings: organization, branding, team, messaging, invoicing
 * details, personalisation and account. Organization-scoped sections need the
 * ADMIN or OWNER role; a member only sees their organization and account, and
 * nothing a member cannot read is fetched for them.
 */
export async function SettingsView() {
  const context = await getOrganizerContext();
  const isManager = context !== null && MANAGER_ROLES.includes(context.role);
  const settings = isManager ? await loadManagerSettings() : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your organization, your team and your account.</p>
      </div>

      <Tabs defaultValue={settings ? "branding" : "organization"} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="organization">Organization</TabsTrigger>
          {settings ? <TabsTrigger value="branding">Branding</TabsTrigger> : null}
          {settings?.team ? <TabsTrigger value="members">Members</TabsTrigger> : null}
          {settings ? <TabsTrigger value="messaging">Messaging providers</TabsTrigger> : null}
          {settings ? <TabsTrigger value="legal">Invoicing details</TabsTrigger> : null}
          {settings ? <TabsTrigger value="personalisation">Personalisation</TabsTrigger> : null}
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="mt-0">
          <OrganizationView
            brandName={context?.brandName ?? DEFAULT_BRANDING.displayName}
            role={context?.role ?? ""}
            isManager={isManager}
            username={settings?.username ?? null}
            memberships={context?.memberships ?? []}
          />
        </TabsContent>

        {settings ? (
          <>
            <TabsContent value="branding" className="mt-0">
              <BrandingView branding={settings.branding} />
            </TabsContent>
            {settings.team ? (
              <TabsContent value="members" className="mt-0">
                <MembersView
                  members={settings.team.members}
                  invitations={settings.team.invitations}
                  currentUserId={context?.userId ?? ""}
                />
              </TabsContent>
            ) : null}
            <TabsContent value="messaging" className="mt-0">
              <ProviderSettingsView initial={settings.providers} />
            </TabsContent>
            <TabsContent value="legal" className="mt-0">
              <LegalIdentityView identity={settings.legalIdentity} />
            </TabsContent>
            <TabsContent value="personalisation" className="mt-0">
              <PersonalisationView initialVocabulary={settings.vocabulary} templateSummaries={settings.templates} />
            </TabsContent>
          </>
        ) : null}

        <TabsContent value="account" className="mt-0">
          <AccountView fullName={context?.fullName ?? null} email={context?.email ?? ""} role={context?.role ?? ""} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
