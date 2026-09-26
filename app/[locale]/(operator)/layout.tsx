import { Toaster } from "@/components/ui/sonner";

/**
 * Staff consoles opened from a link (check-in, day line). The Toaster carries
 * their action feedback: a payment recorded, a desk that got there first.
 */
export default function OperatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 flex-col bg-zinc-950 dark:bg-black">
      {children}
      <Toaster />
    </div>
  );
}
