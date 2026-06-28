import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-col items-center gap-8 px-6 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Jikū
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Event invitations, ticketing, RSVP, and check-in — all in one
          white-label platform.
        </p>
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Go to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
