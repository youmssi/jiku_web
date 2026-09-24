import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { LandingContent } from "./content";
import { SectionHeading } from "./section-heading";

export function FaqSection({ content }: { content: LandingContent["faq"] }) {
  return (
    <section id="faq" className="scroll-mt-24 border-t border-border/30 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading badge={content.badge} heading={content.heading} subheading={content.subheading} />
        <Accordion type="single" collapsible className="mt-12">
          {content.items.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-base">{item.question}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
