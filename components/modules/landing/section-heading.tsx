import { Badge } from "@/components/ui/badge";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { cn } from "@/lib/utils";

/** The badge, title and lead every landing section opens with. */
export function SectionHeading({
  badge,
  heading,
  subheading,
  align = "center",
}: {
  badge: string;
  heading: string;
  subheading?: string;
  align?: "center" | "start";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left")}>
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
        <JikūLogo variant="mark" className="size-3.5" />
        {badge}
      </div>
      <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{heading}</h2>
      {subheading ? <p className="mt-4 text-base text-muted-foreground sm:text-lg">{subheading}</p> : null}
    </div>
  );
}

/** Marks a capability that is on its way, so the page never promises it as live. */
export function SoonBadge({ label }: { label: string }) {
  return <Badge variant="outline">{label}</Badge>;
}
