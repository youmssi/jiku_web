"use server";

import { redirect } from "next/navigation";
import { apiBaseUrl } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import { setAuthCookies, clearAuthCookies, type AuthTokens } from "@/lib/auth";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@/components/modules/identity/schema";

type ActionResult = { error: string } | undefined;

export async function registerAction(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please check the form and try again." };
  }
  const response = await fetch(`${apiBaseUrl()}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
    cache: "no-store",
  });
  if (response.status === 409) {
    return { error: "An account with this email already exists." };
  }
  if (!response.ok) {
    return { error: "We couldn't create your account. Please try again." };
  }
  const tokens = (await response.json()) as AuthTokens;
  await setAuthCookies(tokens);
  redirect(ROUTES.DASHBOARD);
}

export async function loginAction(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please check the form and try again." };
  }
  const response = await fetch(`${apiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
    cache: "no-store",
  });
  if (response.status === 401) {
    return { error: "Invalid email or password." };
  }
  if (response.status === 429) {
    return { error: "Too many attempts. Please wait a moment and try again." };
  }
  if (!response.ok) {
    return { error: "We couldn't sign you in. Please try again." };
  }
  const tokens = (await response.json()) as AuthTokens;
  await setAuthCookies(tokens);
  redirect(ROUTES.DASHBOARD);
}

export async function logoutAction(): Promise<void> {
  await clearAuthCookies();
  redirect(ROUTES.LOGIN);
}
