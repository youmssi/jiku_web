"use server";

import { getTranslations } from "next-intl/server";
import { localeRedirect } from "@/i18n/redirect";
import { publicFetch, serverFetch } from "@/lib/api-server";
import { ROUTES } from "@/lib/constants";
import { setAuthCookies, clearAuthCookies, type AuthTokens } from "@/lib/auth";
import { clearChallenge, deviceInfo, readChallenge, rememberDevice, setChallenge, trustedDeviceToken } from "@/lib/two-step";
import type { SignInStep, TwoStepInput } from "@/components/shared/two-step";
import { type ActionResult, fail, ok, problemCode, reportApiError } from "@/lib/action-result";
import {
  MARKETING_CONSENT_VERSION,
  createOrgSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  registerToJoinSchema,
  resetPasswordSchema,
  type CreateOrgInput,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
} from "@/components/modules/identity/schema";
import { safeNext } from "@/lib/safe-next";
import { withoutLocalePrefix } from "@/lib/locale-path";
import { guestRouting } from "@/i18n/routing";

export async function registerAction(
  input: RegisterInput,
  next?: string,
): Promise<ActionResult> {
  const t = await getTranslations();
  // Joining a team (a `next` back to the invitation) names no organization;
  // every other sign-up creates its own in the same request.
  const joining = Boolean(next);
  const parsed = (joining ? registerToJoinSchema : registerSchema).safeParse(input);
  if (!parsed.success) {
    return fail(t("common.errors.checkForm"));
  }
  const { fullName, email, password, marketingConsent } = parsed.data;
  const name = "organizationName" in parsed.data ? parsed.data.organizationName : undefined;
  const response = await publicFetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, fullName, email, password, marketingConsent, marketingConsentVersion: MARKETING_CONSENT_VERSION }),
  });
  if (!response.ok) {
    // A taken address and a burst of attempts are the visitor's to fix, with
    // their own message; anything else is ours to look at.
    if (response.status === 409) return fail(t("auth.register.emailTaken"));
    if (response.status === 429) return fail(t("common.errors.tooManyAttempts"));
    reportApiError(response);
    return fail(t("auth.register.failedRetry"));
  }
  const tokens = (await response.json()) as AuthTokens;
  await setAuthCookies(tokens);
  // The organization exists already; the address is confirmed later, before
  // the first invitation leaves (JIKU-253).
  return localeRedirect(afterSignIn(next));
}

/**
 * A refused sign-in that asks for the authentication app's code (JIKU-317): the
 * step token goes into an httpOnly cookie and the form shows the code step.
 */
async function codeStepFrom(response: Response): Promise<ActionResult<SignInStep> | null> {
  if (response.status !== 401 || (await problemCode(response)) !== "auth.mfa-required") return null;
  const body = (await response.json().catch(() => null)) as { challengeToken?: unknown } | null;
  if (typeof body?.challengeToken !== "string") return null;
  await setChallenge("organizer", body.challengeToken);
  return ok({ step: "code" });
}

/** The code step of a sign-in (JIKU-317): the app's code or one backup code. */
export async function verifyTwoStepAction(input: TwoStepInput, next?: string): Promise<ActionResult<SignInStep>> {
  const t = await getTranslations("common.twoStep");
  const challengeToken = await readChallenge("organizer");
  if (!challengeToken) return fail(t("expired"));
  const response = await publicFetch("/auth/mfa/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challengeToken, ...input, ...(await deviceInfo()) }),
  });
  if (!response.ok) {
    if (response.status === 429) return fail(t("tooMany"));
    if (response.status === 401) return fail(t(input.backupCode ? "invalidBackup" : "invalid"));
    reportApiError(response);
    return fail(t("failed"));
  }
  const tokens = (await response.json()) as AuthTokens & { trustedDeviceToken?: string | null };
  await clearChallenge("organizer");
  await rememberDevice("organizer", tokens.trustedDeviceToken);
  await setAuthCookies(tokens);
  return localeRedirect(afterSignIn(next));
}

/** A passkey ceremony: the id the API keeps it under and the options for the browser (JIKU-318). */
export interface PasskeyCeremony {
  ceremonyId: string;
  options: Record<string, unknown>;
}

/** Starts a passkey sign-in: the challenge any of this site's passkeys can sign. */
export async function startPasskeySignInAction(): Promise<ActionResult<PasskeyCeremony>> {
  const t = await getTranslations("auth.passkey");
  const response = await publicFetch("/auth/passkey/options", { method: "POST" });
  if (!response.ok) {
    if (response.status !== 429) reportApiError(response);
    return fail(t(response.status === 429 ? "tooMany" : "failed"));
  }
  return ok((await response.json()) as PasskeyCeremony);
}

/** Finishes a passkey sign-in: a passkey is both factors, so the session opens at once. */
export async function finishPasskeySignInAction(
  ceremonyId: string,
  credential: Record<string, unknown>,
  next?: string,
): Promise<ActionResult> {
  const t = await getTranslations("auth.passkey");
  const response = await publicFetch("/auth/passkey", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ceremonyId, credential, ...(await deviceInfo()) }),
  });
  if (!response.ok) {
    if (response.status === 403 && (await problemCode(response)) === "account.suspended") return fail(t("suspended"));
    if (response.status !== 401 && response.status !== 429) reportApiError(response);
    return fail(t(response.status === 429 ? "tooMany" : response.status === 401 ? "unknown" : "failed"));
  }
  await setAuthCookies((await response.json()) as AuthTokens);
  return localeRedirect(afterSignIn(next));
}

export async function loginAction(input: LoginInput, next?: string): Promise<ActionResult<SignInStep>> {
  const t = await getTranslations();
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return fail(t("common.errors.checkForm"));
  }
  const response = await publicFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...parsed.data,
      ...(await deviceInfo()),
      trustedDeviceToken: (await trustedDeviceToken("organizer")) ?? null,
    }),
  });
  const codeStep = await codeStepFrom(response);
  if (codeStep) return codeStep;
  if (!response.ok) {
    if (response.status !== 401 && response.status !== 403 && response.status !== 429) {
      reportApiError(response);
    }
    if (response.status === 403 && (await problemCode(response)) === "account.suspended") {
      return fail(t("auth.login.suspended"));
    }
    if (response.status === 401) {
      // Google-only accounts get the backend's pointer to the right door
      // (ProblemDetail carries the reason in `detail`).
      const body = (await response.json().catch(() => null)) as { detail?: string } | null;
      return fail(body?.detail ?? t("auth.login.invalidCredentials"));
    }
    return fail(
      response.status === 429
        ? t("common.errors.tooManyAttempts")
        : t("auth.login.failedRetry"),
    );
  }
  const tokens = (await response.json()) as AuthTokens;
  await setAuthCookies(tokens);
  // The app layout bounces members with no organization to onboarding.
  return localeRedirect(afterSignIn(next));
}

/** Exchanges the Google Identity Services credential for a session (JIKU-51). */
export async function googleLoginAction(idToken: string, next?: string): Promise<ActionResult<SignInStep>> {
  const t = await getTranslations();
  let response: Response;
  try {
    response = await publicFetch("/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idToken,
        ...(await deviceInfo()),
        trustedDeviceToken: (await trustedDeviceToken("organizer")) ?? null,
      }),
    });
  } catch {
    // The backend aborts a slow request after 10s (e.g. a cold instance). A
    // thrown fetch must become a visible message, not a silently-swallowed
    // rejection that leaves the visitor on the login page with no feedback.
    return fail(t("common.errors.unreachable"));
  }
  const codeStep = await codeStepFrom(response);
  if (codeStep) return codeStep;
  if (!response.ok) {
    if (response.status !== 401) {
      reportApiError(response);
    }
    return fail(
      response.status === 501
        ? t("auth.google.unavailable")
        : t("auth.google.failed"),
    );
  }
  const tokens = (await response.json()) as AuthTokens;
  await setAuthCookies(tokens);
  return localeRedirect(afterSignIn(next));
}

export async function forgotPasswordAction(input: ForgotPasswordInput): Promise<ActionResult> {
  const t = await getTranslations();
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return fail(t("common.validation.email"));
  }
  const response = await publicFetch("/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  if (!response.ok) {
    reportApiError(response);
    return fail(
      response.status === 429
        ? t("common.errors.tooManyAttempts")
        : t("common.errors.generic"),
    );
  }
  // Deliberately identical whether or not the address has an account.
  return ok(null);
}

export async function resetPasswordAction(
  token: string,
  input: ResetPasswordInput,
): Promise<ActionResult> {
  const t = await getTranslations();
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return fail(t("common.validation.passwordMin"));
  }
  const response = await publicFetch("/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password: parsed.data.password }),
  });
  if (!response.ok) {
    if (response.status !== 400) {
      reportApiError(response);
    }
    return fail(
      response.status === 400
        ? t("auth.reset.invalidLink")
        : t("common.errors.generic"),
    );
  }
  return ok(null);
}

export async function verifyEmailAction(token: string): Promise<ActionResult> {
  const t = await getTranslations();
  const response = await publicFetch("/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) {
    if (response.status === 400) return fail(t("auth.verify.invalidLink"));
    if (response.status === 429) return fail(t("common.errors.tooManyAttempts"));
    reportApiError(response);
    return fail(t("common.errors.generic"));
  }
  return ok(null);
}

export async function resendVerificationAction(): Promise<ActionResult> {
  const t = await getTranslations();
  const response = await serverFetch("/auth/verify-email/resend", { method: "POST" });
  if (!response.ok) {
    reportApiError(response);
    return fail(t("auth.verify.resendFailed"));
  }
  return ok(null);
}

/** Creates the caller's organization; the returned tokens are already bound to it. */
export async function createOrgAction(input: CreateOrgInput): Promise<ActionResult> {
  const t = await getTranslations();
  const parsed = createOrgSchema.safeParse(input);
  if (!parsed.success) {
    return fail(t("common.errors.checkForm"));
  }
  const response = await serverFetch("/orgs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  if (!response.ok) {
    reportApiError(response);
    return fail(t("auth.onboarding.failed"));
  }
  const tokens = (await response.json()) as AuthTokens;
  await setAuthCookies(tokens);
  return localeRedirect(ROUTES.DASHBOARD);
}

/** Rebinds the session to another organization the user belongs to (JIKU-48). */
export async function switchOrgAction(tenantId: string): Promise<ActionResult> {
  const t = await getTranslations();
  const response = await serverFetch("/auth/switch-org", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tenantId }),
  });
  if (!response.ok) {
    reportApiError(response);
    return fail(t("auth.switchOrgFailed"));
  }
  const tokens = (await response.json()) as AuthTokens;
  await setAuthCookies(tokens);
  return localeRedirect(ROUTES.DASHBOARD);
}

/** Accepts a member invitation; tokens come back bound to the joined org (JIKU-50). */
export async function acceptInvitationAction(token: string): Promise<ActionResult> {
  const t = await getTranslations();
  const response = await serverFetch("/auth/invitations/accept", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) {
    if (response.status !== 400 && response.status !== 403 && response.status !== 409) {
      reportApiError(response);
    }
    return fail(
      response.status === 400
        ? t("auth.invitation.invalid")
        : response.status === 403
          ? t("auth.invitation.otherEmail")
          : response.status === 409
            ? t("auth.invitation.alreadyMember")
            : t("auth.invitation.failedRetry"),
    );
  }
  const tokens = (await response.json()) as AuthTokens;
  await setAuthCookies(tokens);
  return localeRedirect(ROUTES.DASHBOARD);
}

export async function logoutAction(): Promise<void> {
  await clearAuthCookies();
  return localeRedirect(ROUTES.LOGIN);
}

/**
 * Where a fresh session goes: the page asked for, kept on this site, without a
 * locale prefix since the redirect adds the current one (JIKU-310).
 */
function afterSignIn(next: string | undefined): string {
  return withoutLocalePrefix(safeNext(next, ROUTES.DASHBOARD), guestRouting.locales);
}
