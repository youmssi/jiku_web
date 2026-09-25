import { SettingsView } from "@/components/modules/settings";

/** `?tab=` opens a section directly, such as the messaging providers from billing. */
export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  return <SettingsView tab={tab} />;
}
