import Link from "next/link";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { getOrganizerContext } from "@/components/modules/identity/organizer-context";

/** Signed-in organizer landing screen. */
export async function OrganizerHome() {
  const context = await getOrganizerContext();
  if (!context) {
    redirect(ROUTES.LOGIN);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {context.brandName}</h1>
        <p className="text-sm text-muted-foreground">
          You are signed in as {context.role.toLowerCase().replace(/_/g, " ")}.
        </p>
      </div>
      <p className="mt-4 rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
        New here? Anytime you need help, use the <strong>Help &amp; support</strong>{" "}
        button in the bottom-right corner. We&apos;re a message away.
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
