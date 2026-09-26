"use server";

import { getTranslations } from "next-intl/server";
import { serverFetch } from "@/lib/api-server";
import { type ActionResult, fail, ok, reportApiError } from "@/lib/action-result";
import type { OperatorInput, OperatorView } from "@/components/modules/operator/schema";

/**
 * The organizer's operator actions (JIKU-116): create one with its scope and
 * actions, change them, or revoke it, which stops its link at once.
 */
async function result(response: Response): Promise<ActionResult<OperatorView>> {
  if (response.ok) return ok((await response.json()) as OperatorView);
  const t = await getTranslations("operator.team.errors");
  if (response.status === 403) return fail(t("forbidden"));
  if (response.status === 400) return fail(t("invalid"));
  reportApiError(response);
  return fail(t("failed"));
}

export async function createOperatorAction(input: OperatorInput): Promise<ActionResult<OperatorView>> {
  return result(
    await serverFetch("/operators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function updateOperatorAction(id: string, input: OperatorInput): Promise<ActionResult<OperatorView>> {
  return result(
    await serverFetch(`/operators/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function revokeOperatorAction(id: string): Promise<ActionResult<OperatorView>> {
  return result(await serverFetch(`/operators/${encodeURIComponent(id)}/revoke`, { method: "POST" }));
}
