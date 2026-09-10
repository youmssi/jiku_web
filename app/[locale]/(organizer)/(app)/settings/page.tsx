import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOrganizerContext } from "@/components/modules/identity/organizer-context";
import { MembersView, fetchMembersAction } from "@/components/modules/members";
import {
  AccountView,
  BrandingView,
  LegalIdentityView,
  OrganizationView,
  PersonalisationView,
  ProviderSettingsView,
  fetchBrandingAction,
  fetchLegalIdentityAction,
  fetchOrgProfileAction,
  fetchProviderSettingsAction,
  fetchTemplatesAction,
  fetchVocabularyAction,
  type BrandingResponse,
  type LegalIdentityResponse,
  type ProviderSettingsResponse,
  type TemplateSummary,
  type VocabularyEntry,
} from "@/components/modules/settings";

const MANAGER_ROLES = ["ORGANIZER_OWNER", "ORGANIZER_ADMIN"];

async function loadBranding(): Promise<BrandingResponse> {
  const result = await fetchBrandingAction();
  if (!result.ok) {
    return { displayName: "Your organization", logoUrl: null, primaryColor: "#2563EB" };
  }
  return result.data;
}

async function loadProviderSettings(): Promise<ProviderSettingsResponse> {
  const result = await fetchProviderSettingsAction();
  if (!result.ok) {
    return {
      email: { configured: false, provider: null, from: null, fromName: null, apiKeyMasked: null },
      whatsapp: { configured: false, provider: null, phoneNumberId: null, accessTokenMasked: null, templateName: null, templateLanguage: null },
    };
  }
  return result.data;
}

async function loadLegalIdentity(): Promise<LegalIdentityResponse> {
  const result = await fetchLegalIdentityAction();
  if (!result.ok) {
    return {
      legalName: null,
      registrationNumber: null,
      taxIdentifier: null,
      addressLine: null,
      city: null,
      country: null,
      completeForInvoicing: false,
    };
  }
  return result.data;
}

export default async function SettingsPage() {
  const context = await getOrganizerContext();
  // Organization-scoped settings require ADMIN or OWNER; a MEMBER's backend
  // calls would 403, so nothing is fetched for them and the tabs never render.
  const isManager = context !== null && MANAGER_ROLES.includes(context.role);

  const [orgProfile, branding, providers, legalIdentity, membersResult, vocabulary, templates] =
    isManager
      ? await Promise.all([
          fetchOrgProfileAction(),
          loadBranding(),
          loadProviderSettings(),
          loadLegalIdentity(),
          fetchMembersAction(),
          fetchVocabularyAction().then((entries) => entries),
          fetchTemplatesAction().then((list) => list),
        ])
      : [null, null, null, null, { ok: false as const, error: "" }, [], []];

  // Members management needs the ADMIN/OWNER role; the tab hides for members.
  const team = membersResult.ok ? membersResult.data : null;
  const vocabularyEntries: VocabularyEntry[] = vocabulary.length ? vocabulary : [];
  const templateSummaries: TemplateSummary[] = templates.length ? templates : [];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your organization, your team and your account.
        </p>
      </div>

      <Tabs defaultValue={isManager ? "branding" : "organization"} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="organization">Organization</TabsTrigger>
          {isManager ? <TabsTrigger value="branding">Branding</TabsTrigger> : null}
          {isManager && team ? <TabsTrigger value="members">Members</TabsTrigger> : null}
          {isManager ? <TabsTrigger value="messaging">Messaging providers</TabsTrigger> : null}
          {isManager ? <TabsTrigger value="legal">Invoicing details</TabsTrigger> : null}
          {isManager ? <TabsTrigger value="personnalisation">Personnalisation</TabsTrigger> : null}
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="mt-0">
          <OrganizationView
            brandName={context?.brandName ?? "Your organization"}
            role={context?.role ?? ""}
            isManager={isManager}
            username={orgProfile?.username ?? null}
            memberships={context?.memberships ?? []}
          />
        </TabsContent>

        {isManager ? (
          <TabsContent value="branding" className="mt-0">
            <BrandingView branding={branding ?? { displayName: "Your organization", logoUrl: null, primaryColor: "#2563EB" }} />
          </TabsContent>
        ) : null}

        {isManager && team ? (
          <TabsContent value="members" className="mt-0">
            <MembersView
              members={team.members}
              invitations={team.invitations}
              currentUserId={context?.userId ?? ""}
            />
          </TabsContent>
        ) : null}

        {isManager ? (
          <TabsContent value="messaging" className="mt-0">
            <ProviderSettingsView initial={providers ?? { email: { configured: false, provider: null, from: null, fromName: null, apiKeyMasked: null }, whatsapp: { configured: false, provider: null, phoneNumberId: null, accessTokenMasked: null, templateName: null, templateLanguage: null } }} />
          </TabsContent>
        ) : null}

        {isManager ? (
          <TabsContent value="legal" className="mt-0">
            <LegalIdentityView identity={legalIdentity ?? { legalName: null, registrationNumber: null, taxIdentifier: null, addressLine: null, city: null, country: null, completeForInvoicing: false }} />
          </TabsContent>
        ) : null}

        {isManager ? (
          <TabsContent value="personnalisation" className="mt-0">
            <PersonalisationView
              initialVocabulary={vocabularyEntries}
              templateSummaries={templateSummaries}
            />
          </TabsContent>
        ) : null}

        <TabsContent value="account" className="mt-0">
          <AccountView
            fullName={context?.fullName ?? null}
            email={context?.email ?? ""}
            role={context?.role ?? ""}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
