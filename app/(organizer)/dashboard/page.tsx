import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiBaseUrl } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { logoutAction } from "@/components/modules/organizer/services/auth";

interface CurrentUser {
  userId: string;
  tenantId: string;
  role: string;
}

interface Branding {
  displayName: string;
  primaryColor: string;
  logoUrl: string | null;
}

async function authedGet<T>(path: string): Promise<T | null> {
  const token = await getAccessToken();
  if (!token) {
    return null;
  }
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as T;
}

export default async function DashboardPage() {
  const me = await authedGet<CurrentUser>("/auth/me");
  if (!me) {
    redirect("/login");
  }
  const branding = await authedGet<Branding>("/branding");
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
      <div className="mt-8 rounded-lg border border-dashed p-10 text-center text-muted-foreground">
        Your events and guest management tools will appear here.
      </div>
    </div>
  );
}
