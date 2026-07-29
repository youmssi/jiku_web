import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { adminLogoutAction } from "@/components/modules/admin";
import { Button } from "@/components/ui/button";
import { getAdminAccessToken } from "@/lib/auth";
import { ADMIN_ROUTES } from "@/lib/constants";

export const metadata = { robots: { index: false } };

const NAV = [
  { label: "Tenants", href: ADMIN_ROUTES.TENANTS },
  { label: "Bookings", href: ADMIN_ROUTES.BOOKINGS },
  { label: "Booking payments", href: ADMIN_ROUTES.BOOKING_PAYMENTS },
  { label: "Payments", href: ADMIN_ROUTES.PAYMENTS },
  { label: "Trials", href: ADMIN_ROUTES.TRIALS },
  { label: "Agreements", href: ADMIN_ROUTES.AGREEMENTS },
  { label: "Audit", href: ADMIN_ROUTES.AUDIT },
] as const;

/**
 * Guarded back-office shell (JIKU-46). The cookie check is the cheap first gate;
 * every data fetch still runs against the PLATFORM_ADMIN-protected endpoints, so
 * a stale or forged cookie only ever reaches an empty, 403'd page.
 */
export default async function AdminAppLayout({ children }: Readonly<{ children: ReactNode }>) {
  if (!(await getAdminAccessToken())) {
    redirect(ADMIN_ROUTES.LOGIN);
  }
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
          <span className="text-sm font-semibold">Jikū admin</span>
          <nav className="flex flex-1 flex-wrap items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={adminLogoutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
