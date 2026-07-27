import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";

/**
 * Shared chrome for the auth pages (login, register, password reset, email
 * verification): a slim header whose brand mark and back link both lead to the
 * landing page, so visitors are never stranded on an auth screen.
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 flex-col">
      <AuthHeader />
      {children}
    </div>
  );
}

async function AuthHeader() {
  const t = await getTranslations("auth");
  return (
    <header className="flex items-center justify-between px-4 py-3 sm:px-6">
      <Link
        href={ROUTES.HOME}
        className="font-heading text-lg font-semibold tracking-tight"
      >
        {t("brand")}
      </Link>
      <Link
        href={ROUTES.HOME}
        className="flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("backToHome")}
      </Link>
    </header>
  );
}
