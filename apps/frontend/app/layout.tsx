'use client';
//configに設定する
import { useEffect } from 'react';
import { initAmplify } from '@/service/amplify-client';
import { useAuthStore } from '@/store/authStore';
import './globals.css';

/** Amplifyの初期設定実行 */
initAmplify();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <html lang="ja">
      <body className="flex min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
