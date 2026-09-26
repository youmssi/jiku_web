import { getTranslations } from "next-intl/server";
import { publicFetch } from "@/lib/api-server";
import { ValidatorConsole } from "@/components/modules/checkin/validator-console";
import type { ValidatorContext } from "@/components/modules/checkin/schema";

/**
 * Validator check-in screen, authenticated by the link token in the path: an
 * event's door link, or an operator's link opened on one of its events.
 */
export async function CheckinView({ door }: { door: string }) {
  const response = await publicFetch(`/${door}`);

  if (!response.ok) {
    const revoked = response.status === 403;
    const t = await getTranslations("operator.door");
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <h2 className="text-2xl font-semibold text-zinc-100">
            {revoked ? t("revokedTitle") : t("invalidTitle")}
          </h2>
          <p className="mt-2 text-zinc-400">
            {revoked ? t("revokedText") : t("invalidText")}
          </p>
        </div>
      </div>
    );
  }

  const context = (await response.json()) as ValidatorContext;

  return <ValidatorConsole door={door} context={context} />;
}
