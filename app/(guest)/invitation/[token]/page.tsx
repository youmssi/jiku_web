interface InvitationPageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { token } = await params;

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200">
          Event Invitation
        </h2>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Your invitation details and RSVP options will appear here.
        </p>
        <p className="mt-6 text-xs text-zinc-400 dark:text-zinc-500">
          Invitation: {token.slice(0, 12)}...
        </p>
      </div>
    </div>
  );
}
