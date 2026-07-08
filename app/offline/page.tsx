import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline — Jikū",
};

/**
 * Branded fallback shown by the service worker when a navigation is attempted with
 * no network and no cached copy of the requested page (JIKU-9).
 */
export default function OfflinePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-950 px-6 py-16 text-center text-zinc-100">
      <div className="max-w-sm">
        <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
          Jikū
        </p>
        <h1 className="mt-3 text-2xl font-semibold">You&apos;re offline</h1>
        <p className="mt-2 text-zinc-400">
          This page isn&apos;t available without a connection. Reconnect and try
          again — pages you&apos;ve already opened will keep working.
        </p>
      </div>
    </div>
  );
}
