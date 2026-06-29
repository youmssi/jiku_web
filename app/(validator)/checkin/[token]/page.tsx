import { apiBaseUrl } from "@/lib/api";
import { ValidatorConsole } from "@/components/modules/validator/components/validator-console";
import type { ValidatorContext } from "@/components/modules/validator/checkin-types";

interface CheckinPageProps {
  params: Promise<{ token: string }>;
}

export default async function CheckinPage({ params }: CheckinPageProps) {
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
