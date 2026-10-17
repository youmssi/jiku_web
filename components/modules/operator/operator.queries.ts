import "server-only";

import { publicFetch, serverFetch } from "@/lib/api-server";
import { reportApiError } from "@/lib/action-result";
import type { OperatorConsoleView, OperatorTeamView, ScopeChoice } from "@/components/modules/operator/schema";

/**
 * Reads for an operator's console (JIKU-116), for Server Components only. The
 * operator's link carries a short code; it is exchanged here, server-side, for
 * the signed token the API works with, so the token never shows in the URL.
 * A revoked or unknown code resolves to null. A door link (JIKU-250) asks for
 * a token pinned to the operator's single event.
 */
export async function resolveOperatorCode(code: string, { door = false }: { door?: boolean } = {}): Promise<string | null> {
  const response = await publicFetch(`/operator-codes/${encodeURIComponent(code)}${door ? "?door=true" : ""}`);
  if (!response.ok) return null;
  const { token } = (await response.json()) as { token: string };
  return token;
}

export async function loadOperatorConsole(token: string): Promise<OperatorConsoleView | null> {
  const response = await publicFetch(`/operator/${encodeURIComponent(token)}`);
  if (!response.ok) return null;
  return (await response.json()) as OperatorConsoleView;
}

/** The organizer's operators, and the events and services they can be given. */
export async function loadOperatorTeam(): Promise<{
  team: OperatorTeamView | null;
  events: ScopeChoice[];
  services: ScopeChoice[];
}> {
  const [team, events, services] = await Promise.all([
    serverFetch("/operators"),
    serverFetch("/events"),
    serverFetch("/services"),
  ]);
  if (!team.ok) reportApiError(team, "operator");
  const choices = async (response: Response): Promise<ScopeChoice[]> =>
    response.ok ? ((await response.json()) as ScopeChoice[]).map(({ id, name }) => ({ id, name })) : [];
  return {
    team: team.ok ? ((await team.json()) as OperatorTeamView) : null,
    events: await choices(events),
    services: await choices(services),
  };
}
