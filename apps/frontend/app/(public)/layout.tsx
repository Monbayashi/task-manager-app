'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ToastAlerts } from '@/components/layout/toast-alerts';
import { getCurrentUser } from '@aws-amplify/auth';

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const searchParam = useSearchParams();

  useEffect(() => {
    const checkUser = async () => {
      try {
        await getCurrentUser();
        router.replace('/choose-team/');
      } catch {
        // 未処理
      }
    };
    checkUser();
  }, [router, searchParam]);

  return (
    <>
      <ToastAlerts />
      {children}
    </>
  );
}
