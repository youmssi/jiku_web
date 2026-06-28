export default function ValidatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 flex-col bg-zinc-950 dark:bg-black">
      {children}
    </div>
  );
}
