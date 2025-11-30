'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSyncMe } from '@/api/users/useMe';
import { ToastAlerts } from '@/components/layout/toast-alerts';
import { Loading } from '@/components/ui/loading';
import { useUserStore } from '@/store/user';
import { getCurrentUser } from 'aws-amplify/auth';

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathName = usePathname();
  const pathParams = useSearchParams();
  // ローディング画面の表示をするかの判定用フラグ
  const [isLoadingLogined, setIsLoadingLogined] = useState(false);
  const [isLoadingExsisted, setIsLoadingExsisted] = useState(false);
  // ユーザデータ取得
  useSyncMe();
  const stauts = useUserStore((s) => s.status);
  const user = useUserStore((s) => s.user);

  // ログイン済みチェック
  useEffect(() => {
    console.log('ログイン済みチェック');
    const checkLogin = async () => {
      console.log(`${pathName}?${pathParams.toString()}`);
      try {
        await getCurrentUser();
      } catch {
        const redirectURL = encodeURIComponent(`${pathName}?${pathParams.toString()}`);
        router.push(`/login?redirect=${redirectURL}`);
      } finally {
        setIsLoadingLogined(true);
      }
    };
    checkLogin();
  }, [router, pathName, pathParams]);

  // 登録ユーザ存在チェック
  useEffect(() => {
    console.log('登録ユーザ存在チェック:', stauts);
    if (stauts === 'done') {
      if (!user) {
        router.push(`/wellcome`);
        setTimeout(() => setIsLoadingExsisted(true), 500);
      } else if (user.teams.length === 0) {
        router.push('/new-team');
        setTimeout(() => setIsLoadingExsisted(true), 500);
      }
      setTimeout(() => setIsLoadingExsisted(true), 500);
    }
  }, [router, stauts, user]);

  return (
    <>
      <ToastAlerts />
      {isLoadingLogined && isLoadingExsisted ? children : <Loading />}
    </>
  );
}
