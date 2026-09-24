import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { ROUTES } from "@/lib/constants";

/**
 * One frame for every account screen: sign-in, sign-up, password recovery,
 * email verification, first organization and team invitations. A slim brand
 * header leads back to the landing page, and each page drops a single
 * `AuthCard` into the centered column, so all of them read the same way.
 */
export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await getTranslations("auth.layout");
  return (
    <div className="flex flex-1 flex-col bg-muted">
      <header className="flex items-center justify-between px-4 py-3 sm:px-6">
        <Link href={ROUTES.HOME} className="text-lg" aria-label={t("backToHome")}>
          <JikūLogo />
        </Link>
        <Link
          href={ROUTES.HOME}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("backToHome")}
        </Link>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">{children}</div>
      </main>
    </div>
  );
}
