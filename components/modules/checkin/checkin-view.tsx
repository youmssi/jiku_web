import { apiBaseUrl } from "@/lib/api";
import { ValidatorConsole } from "@/components/modules/checkin/validator-console";
import type { ValidatorContext } from "@/components/modules/checkin/schema";

/** Validator check-in screen, authenticated by the link token in the path. */
export async function CheckinView({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const response = await fetch(`${apiBaseUrl()}/checkin/${token}`, { cache: "no-store" });

  if (!response.ok) {
    const revoked = response.status === 403;
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <h2 className="text-2xl font-semibold text-zinc-100">
            {revoked ? "Link revoked" : "Invalid check-in link"}
          </h2>
          <p className="mt-2 text-zinc-400">
            {revoked
              ? "This check-in link has been revoked. Ask the organizer for a new one."
              : "This check-in link is invalid or has expired."}
          </p>
        </div>
      </div>
    );
  }

  const context = (await response.json()) as ValidatorContext;

  return <ValidatorConsole token={token} context={context} />;
}
