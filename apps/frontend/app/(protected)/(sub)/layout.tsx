'use client';

export default function ProtectedSubLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <main className="mt-0 w-full flex-1">{children}</main>
      </div>
    </>
  );
}
