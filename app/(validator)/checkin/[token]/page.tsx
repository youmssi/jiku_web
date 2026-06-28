interface CheckinPageProps {
  params: Promise<{ token: string }>;
}

export default async function CheckinPage({ params }: CheckinPageProps) {
  const { token } = await params;

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-semibold text-zinc-100">
          Check-in Scanner
        </h2>
        <p className="mt-2 text-zinc-400">
          QR code scanner and guest search will appear here.
        </p>
        <p className="mt-6 text-xs text-zinc-500">
          Session: {token.slice(0, 12)}...
        </p>
      </div>
    </div>
  );
}
