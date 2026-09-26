import { OperatorHome, OperatorLinkInvalid } from "@/components/modules/operator";
import { loadOperatorConsole, resolveOperatorCode } from "@/components/modules/operator/server";

// An operator's link is a credential in the URL: it must never be indexed.
export const metadata = { robots: { index: false, follow: false, nocache: true } };

/** An operator's single link (JIKU-116): the doors and lines they work on. */
export default async function OperatorPage({ params }: Readonly<{ params: Promise<{ code: string }> }>) {
  const { code } = await params;
  const token = await resolveOperatorCode(code);
  const view = token ? await loadOperatorConsole(token) : null;
  if (!view) return <OperatorLinkInvalid />;
  return <OperatorHome code={code} view={view} />;
}
