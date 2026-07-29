import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOrganizerContext } from "@/components/modules/identity/organizer-context";
import { MembersView, fetchMembersAction } from "@/components/modules/members";
import {
  BrandingView,
  ProviderSettingsView,
  fetchBrandingAction,
  fetchProviderSettingsAction,
  type BrandingResponse,
  type ProviderSettingsResponse,
} from "@/components/modules/settings";

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

export default async function SettingsPage() {
  const [branding, providers, membersResult, context] = await Promise.all([
    loadBranding(),
    loadProviderSettings(),
    fetchMembersAction(),
    getOrganizerContext(),
  ]);
  // Members management needs the ADMIN/OWNER role; the tab hides for members.
  const team = membersResult.ok ? membersResult.data : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your organization&apos;s branding, team and messaging providers.
        </p>
      </div>

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          {team ? <TabsTrigger value="members">Members</TabsTrigger> : null}
          <TabsTrigger value="messaging">Messaging providers</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="mt-0">
          <BrandingView branding={branding} />
        </TabsContent>

        {team ? (
          <TabsContent value="members" className="mt-0">
            <MembersView
              members={team.members}
              invitations={team.invitations}
              currentUserId={context?.userId ?? ""}
            />
          </TabsContent>
        ) : null}

        <TabsContent value="messaging" className="mt-0">
          <ProviderSettingsView initial={providers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
