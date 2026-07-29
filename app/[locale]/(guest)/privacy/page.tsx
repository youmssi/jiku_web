import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "How your personal data is handled for this event.",
};

/**
 * Plain-language privacy notice (JIKU-38), reachable from every guest-facing page.
 * The content is platform-wide (Jikū acts as processor on the organizer's behalf);
 * it is written to be understood by a general audience in under a minute.
 */
export default function PrivacyNoticePage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Your privacy</h1>
      <p className="mt-2 text-muted-foreground">
        A quick, plain explanation of how your details are used for this event.
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-medium">Who has your data</h2>
          <p className="mt-1 text-muted-foreground">
            The event organizer added your name and contact details so they could
            invite you and manage the event. They decide how your data is used, and they
            are the ones responsible for it.
          </p>
        </section>

        <section>
          <h2 className="font-medium">What this platform does</h2>
          <p className="mt-1 text-muted-foreground">
            This invitation and check-in service (Jikū) runs the event on the
            organizer&apos;s behalf. We only use your details to send your invitation,
            record your RSVP, issue your ticket, and check you in on the day. We do not
            sell your data or use it for our own marketing.
          </p>
        </section>

        <section>
          <h2 className="font-medium">What we collect</h2>
          <p className="mt-1 text-muted-foreground">
            Only what the organizer provided and what you do here: your name, email
            and/or phone number, your RSVP answer, and whether you checked in.
          </p>
        </section>

        <section>
          <h2 className="font-medium">How long it is kept</h2>
          <p className="mt-1 text-muted-foreground">
            Your personal details are kept while the event is active and for a limited
            period afterwards (by default about 12 months past the event date), after
            which they are automatically anonymized. Anonymous attendance totals may be
            kept for the organizer&apos;s records.
          </p>
        </section>

        <section>
          <h2 className="font-medium">Deleting your data</h2>
          <p className="mt-1 text-muted-foreground">
            You can remove your personal data at any time using the &ldquo;Request
            deletion of my data&rdquo; option on your invitation or ticket page. This
            permanently anonymizes your details; only an anonymous record that a guest
            was invited remains.
          </p>
        </section>
      </div>
    </div>
  );
}
