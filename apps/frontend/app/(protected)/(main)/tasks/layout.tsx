import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'タスク管理 | タスク管理 App',
  description: 'タスク管理 Appのタスク管理ページ',
};

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
