'use client';
import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Header } from '@/components/layout/header';
import { SideBar } from '@/components/layout/sidebar';
import z from 'zod';

/** チーム選択済みをグループ化 */
export default function ProtectedMainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathName = usePathname();
  const pathParams = useSearchParams();

  // チームIDをQueryで持っていない場合の処理
  useEffect(() => {
    const teamId = pathParams.get('teamId');
    const parseTeamId = z.uuidv7().safeParse(teamId);
    if (parseTeamId.success === false) {
      router.push(`/choose-team?redirect=${pathName}?${pathParams.toString()}`);
    }
  }, [router, pathName, pathParams]);

  return (
    <>
      <SideBar />
      <div className="flex min-h-screen w-full min-w-0 flex-col lg:ml-64">
        <Breadcrumbs />
        <Header />
        <main className="w-full flex-1 lg:mt-0">{children}</main>
      </div>
    </>
  );
}
