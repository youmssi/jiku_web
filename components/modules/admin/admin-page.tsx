import type { ReactNode } from "react";

/** One desk page: its title, then its panel. */
export function AdminPage({ title, children }: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">{title}</h1>
      {children}
    </div>
  );
}
