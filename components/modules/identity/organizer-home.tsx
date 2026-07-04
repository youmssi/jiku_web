import Link from "next/link";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { serverFetch } from "@/lib/api-server";
import { logoutAction } from "@/components/modules/identity/identity.service";
import type { CurrentUser, Branding } from "@/components/modules/identity/schema";

async function fetchJson<T>(path: string): Promise<T | null> {
  const response = await serverFetch(path);
  return response.ok ? ((await response.json()) as T) : null;
}

/** Signed-in organizer landing screen. */
export async function OrganizerHome() {
  const me = await fetchJson<CurrentUser>("/auth/me");
  if (!me) {
    redirect(ROUTES.LOGIN);
  }
  const branding = await fetchJson<Branding>("/branding");
  const displayName = branding?.displayName ?? "your organization";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Welcome, {displayName}</h1>
          <p className="text-sm text-muted-foreground">
            You are signed in as {me.role.toLowerCase().replace("_", " ")}.
          </p>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>
      <p className="mt-4 rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
        New here? Anytime you need help, use the <strong>Help &amp; support</strong>{" "}
        button in the bottom-right corner — we&apos;re a message away.
      </p>
      <div className="mt-8 flex flex-col items-start gap-4 rounded-lg border p-8">
        <div>
          <h2 className="text-lg font-medium">Events</h2>
          <p className="text-sm text-muted-foreground">
            Create events, configure them, and invite your guests.
          </p>
        </div>
        <Button asChild>
          <Link href={ROUTES.EVENTS}>Manage events</Link>
        </Button>
      </div>
    </div>
  );
}
