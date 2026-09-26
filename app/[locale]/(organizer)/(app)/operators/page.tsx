import { getTranslations } from "next-intl/server";
import { OperatorTeam } from "@/components/modules/operator";
import { loadOperatorTeam } from "@/components/modules/operator/server";
import { StateMessage } from "@/components/shared";

/** The organizer's operators (JIKU-116): who runs which door or line. */
export default async function OperatorsPage() {
  const [{ team, events, services }, t] = await Promise.all([loadOperatorTeam(), getTranslations("operator.team")]);
  if (!team) return <StateMessage title={t("title")} description={t("errors.forbidden")} />;
  return <OperatorTeam initial={team} events={events} services={services} />;
}
