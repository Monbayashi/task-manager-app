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
  const status = useUserStore((s) => s.status);
  const user = useUserStore((s) => s.user);

  // ログイン済みチェック
  useEffect(() => {
    const checkLogin = async () => {
      try {
        await getCurrentUser();
      } catch (err) {
        console.error(err);
        const redirectURL = encodeURIComponent(`${pathName}?${pathParams.toString()}`);
        router.push(`/login/?redirect=${redirectURL}`);
      } finally {
        setIsLoadingLogined(true);
      }
    };
    checkLogin();
  }, [router, pathName, pathParams]);

  // 登録ユーザ存在チェック
  useEffect(() => {
    if (status === 'init') return;

    if (status === 'empty' || user == null) {
      // ユーザが存在しない場合
      if (!pathName.startsWith('/wellcome')) {
        return router.push(`/wellcome/`);
      }
    } else if (status === 'done' && user.teams.length === 0) {
      // ユーザーが存在し、チームが一つもない場合
      if (!pathName.startsWith('/new-team')) {
        return router.push('/new-team/');
      }
    }

    if (isLoadingExsisted === false) {
      setTimeout(() => {
        setIsLoadingExsisted(true);
      }, 500);
    }
  }, [isLoadingExsisted, pathName, router, status, user]);

  return (
    <>
      <ToastAlerts />
      {isLoadingLogined && isLoadingExsisted ? children : <Loading />}
    </>
  );
}
