import type { BookingAnswer } from "@/components/modules/dayline/schema";

/** What a client answered before the times (JIKU-191), as staff read it at the counter. */
export function BookingAnswers({ answers }: { answers?: BookingAnswer[] }) {
  if (!answers || answers.length === 0) return null;
  return (
    <dl className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
      {answers.map((item) => (
        <div key={item.question} className="flex gap-1">
          <dt className="text-muted-foreground">{item.question}</dt>
          <dd className="font-medium">{item.answer}</dd>
        </div>
      ))}
    </dl>
  );
}
