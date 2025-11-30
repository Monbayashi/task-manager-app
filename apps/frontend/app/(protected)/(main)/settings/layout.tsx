import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '設定 | タスク管理 App',
  description: 'タスク管理 Appの設定ページ',
};

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
