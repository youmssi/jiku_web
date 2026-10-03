import type { ReactNode } from "react";

/** The last call to action of a marketing page, on the brand's near-black (JIKU-221). */
export function ClosingCta({ heading, text, children }: { heading: string; text: string; children: ReactNode }) {
  return (
    <div className="rounded-[2rem] bg-primary px-8 py-16 text-center text-primary-foreground sm:px-16 sm:py-20">
      <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">{heading}</h2>
      <p className="mx-auto mt-5 max-w-xl text-base text-primary-foreground/70 sm:text-lg">{text}</p>
      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">{children}</div>
    </div>
  );
}

/** The outline button that reads on the near-black band. */
export const CLOSING_OUTLINE =
  "h-12 rounded-full border-primary-foreground/25 bg-transparent px-8 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground";
