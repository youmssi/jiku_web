"use server";

import { getTranslations } from "next-intl/server";
import { localeRedirect } from "@/i18n/redirect";
import { publicFetch, serverFetch } from "@/lib/api-server";
import { ROUTES } from "@/lib/constants";
import { setAuthCookies, clearAuthCookies, type AuthTokens } from "@/lib/auth";
import { type ActionResult, fail, ok, reportApiError } from "@/lib/action-result";
import {
  createOrgSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type CreateOrgInput,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
} from "@/components/modules/identity/schema";

/**
 * Only same-origin paths may be used as a post-auth destination — anything else
 * (absolute URLs, protocol-relative `//`) falls back to the dashboard, so a
 * crafted link can never bounce a fresh session to another site.
 */
function safeNext(next: string | undefined, fallback: string): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export async function registerAction(
  input: RegisterInput,
  next?: string,
): Promise<ActionResult> {
  const t = await getTranslations();
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return fail(t("common.errors.checkForm"));
  }
  const response = await publicFetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  if (!response.ok) {
    reportApiError(response);
    return fail(
      response.status === 409
        ? t("auth.register.emailTaken")
        : t("auth.register.failedRetry"),
    );
  }
  const tokens = (await response.json()) as AuthTokens;
  await setAuthCookies(tokens);
  // A fresh account has no organization yet: onboarding creates the first one.
  return localeRedirect(safeNext(next, ROUTES.ONBOARDING));
}

export async function loginAction(input: LoginInput, next?: string): Promise<ActionResult> {
  const t = await getTranslations();
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return fail(t("common.errors.checkForm"));
  }
  const response = await publicFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  if (!response.ok) {
    if (response.status !== 401 && response.status !== 429) {
      reportApiError(response);
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
  return localeRedirect(safeNext(next, ROUTES.DASHBOARD));
}

/** Exchanges the Google Identity Services credential for a session (JIKU-51). */
export async function googleLoginAction(idToken: string, next?: string): Promise<ActionResult> {
  const t = await getTranslations();
  let response: Response;
  try {
    response = await publicFetch("/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  } catch {
    // The backend aborts a slow request after 10s (e.g. a cold instance). A
    // thrown fetch must become a visible message, not a silently-swallowed
    // rejection that leaves the visitor on the login page with no feedback.
    return fail(t("common.errors.unreachable"));
  }
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
  return localeRedirect(safeNext(next, ROUTES.DASHBOARD));
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
    if (response.status !== 400) {
      reportApiError(response);
    }
    return fail(
      response.status === 400
        ? t("auth.verify.invalidLink")
        : t("common.errors.generic"),
    );
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
    if (response.status !== 403) {
      reportApiError(response);
    }
    return fail(
      response.status === 403
        ? t("auth.onboarding.verifyFirst")
        : t("auth.onboarding.failed"),
    );
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
