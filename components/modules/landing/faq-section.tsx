import { ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "@/i18n/navigation";
import { SEO_ROUTES } from "@/lib/constants";
import type { LandingContent } from "./content";
import { SectionHeading } from "./section-heading";

/** The objections a visitor raises before signing up; every question lives on `/faq`. */
export function FaqSection({ content }: { content: LandingContent["faq"] }) {
  return (
    <section id="faq" className="scroll-mt-24 border-t border-border/30 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading badge={content.badge} heading={content.heading} subheading={content.subheading} />
        <Accordion type="single" collapsible className="mt-12">
          {content.items
            .filter((item) => item.featured)
            .map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-base">{item.question}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-8 text-center">
          <Link
            href={SEO_ROUTES.FAQ}
            className="inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
          >
            {content.more}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
