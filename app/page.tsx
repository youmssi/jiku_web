import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

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
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" className="rounded-full">
            <Link href={ROUTES.REGISTER}>Get started</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link href={ROUTES.LOGIN}>Sign in</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
