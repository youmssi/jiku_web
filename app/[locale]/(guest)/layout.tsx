import { Toaster } from "@/components/ui/sonner";
import { cardFontVariables } from "@/lib/card-display-fonts";
import { cn } from "@/lib/utils";

export default function GuestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={cn("flex flex-1 flex-col bg-white dark:bg-zinc-900", cardFontVariables)}>
      {children}
      <Toaster />
    </div>
  );
}
