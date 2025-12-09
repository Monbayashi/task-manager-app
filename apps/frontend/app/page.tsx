/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCognitoOauthRedirect } from '@/lib/cognito-utils';
import { getCurrentUser } from 'aws-amplify/auth';
// ☆これがないと動かない。
// https://github.com/aws-amplify/amplify-js/issues/12589?utm_source=chatgpt.com
import 'aws-amplify/auth/enable-oauth-listener';

export default function RootPage() {
  const router = useRouter();
  const searchParam = useSearchParams();

  useEffect(() => {
    const checkUser = async () => {
      try {
        await getCurrentUser();
        const redirectTo = getCognitoOauthRedirect();
        router.replace(redirectTo ?? '/choose-team/');
      } catch {
        router.replace('/login/');
      }
    };
    checkUser();
  }, [router, searchParam]);

  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center bg-gray-100">
      <div className="mb-4 flex items-center justify-center md:mb-8">
        <img src="/android-chrome-192x192.png" alt="アプリのロゴ" className="mr-3 h-8 w-8 object-contain" />
        <h2 className="text-center text-2xl font-bold text-gray-800 lg:text-3xl">タスク管理 App</h2>
      </div>
    </div>
  );
}
