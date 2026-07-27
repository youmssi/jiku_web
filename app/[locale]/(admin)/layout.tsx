import type { ReactNode } from "react";

/**
 * Back-office chrome (JIKU-46): deliberately plain and clearly distinct from the
 * organizer app — this surface is for the operating team only.
 */
export default function AdminRootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
