'use client';
import { ToastAlerts } from '@/components/layout/toast-alerts';

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ToastAlerts />
      {children}
    </>
  );
}
