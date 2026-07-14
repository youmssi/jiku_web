// Identity module — account auth (register, login, Google, recovery), first-run
// onboarding, and organization switching. The public surface other layers
// consume; internal files import each other directly.
export { LoginForm } from "./login-form";
export { RegisterForm } from "./register-form";
export { ForgotPasswordForm } from "./forgot-password-form";
export { ResetPasswordForm } from "./reset-password-form";
export { VerifyEmailView } from "./verify-email-view";
export { OnboardingForm } from "./onboarding-form";
export { OrgSwitcher } from "./org-switcher";
export { AcceptInvitationView } from "./accept-invitation-view";

export { logoutAction } from "./identity.service";

export { loginSchema, registerSchema } from "./schema";
export type {
  LoginInput,
  RegisterInput,
  Membership,
  InvitationPreview,
} from "./schema";
