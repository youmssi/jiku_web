"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { serverFetch } from "@/lib/api-server";
import { type ActionResult, fail, ok, reportApiError } from "@/lib/action-result";
import { ROUTES } from "@/lib/constants";
import { inviteMemberSchema, type InviteMemberInput, type InvitationView, type MemberView } from "./schema";

async function problemDetail(response: Response): Promise<string | null> {
  const body = (await response.json().catch(() => null)) as { detail?: string } | null;
  return body?.detail ?? null;
}

export async function fetchMembersAction(): Promise<
  { ok: true; data: { members: MemberView[]; invitations: InvitationView[] } } | { ok: false }
> {
  const [membersResponse, invitationsResponse] = await Promise.all([
    serverFetch("/members"),
    serverFetch("/members/invitations"),
  ]);
  if (!membersResponse.ok || !invitationsResponse.ok) {
    return { ok: false };
  }
  return {
    ok: true,
    data: {
      members: (await membersResponse.json()) as MemberView[],
      invitations: (await invitationsResponse.json()) as InvitationView[],
    },
  };
}

export async function inviteMemberAction(input: InviteMemberInput): Promise<ActionResult> {
  const t = await getTranslations("settings.members.errors");
  const parsed = inviteMemberSchema.safeParse(input);
  if (!parsed.success) {
    return fail(t("invalid"));
  }
  const response = await serverFetch("/members/invitations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  if (!response.ok) {
    if (response.status !== 403 && response.status !== 409) {
      reportApiError(response);
    }
    // The backend's reasons are user-ready (verify email first, already a member).
    return fail((await problemDetail(response)) ?? t("invite"));
  }
  revalidatePath(ROUTES.SETTINGS);
  return ok(null);
}

export async function revokeInvitationAction(invitationId: string): Promise<ActionResult> {
  const t = await getTranslations("settings.members.errors");
  const response = await serverFetch(`/members/invitations/${invitationId}`, { method: "DELETE" });
  if (!response.ok) {
    reportApiError(response);
    return fail(t("revoke"));
  }
  revalidatePath(ROUTES.SETTINGS);
  return ok(null);
}

export async function changeMemberRoleAction(userId: string, role: string): Promise<ActionResult> {
  const t = await getTranslations("settings.members.errors");
  const response = await serverFetch(`/members/${userId}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!response.ok) {
    if (response.status !== 403 && response.status !== 409) {
      reportApiError(response);
    }
    return fail((await problemDetail(response)) ?? t("role"));
  }
  revalidatePath(ROUTES.SETTINGS);
  return ok(null);
}

export async function removeMemberAction(userId: string): Promise<ActionResult> {
  const t = await getTranslations("settings.members.errors");
  const response = await serverFetch(`/members/${userId}`, { method: "DELETE" });
  if (!response.ok) {
    if (response.status !== 403 && response.status !== 409) {
      reportApiError(response);
    }
    return fail((await problemDetail(response)) ?? t("remove"));
  }
  revalidatePath(ROUTES.SETTINGS);
  return ok(null);
}
