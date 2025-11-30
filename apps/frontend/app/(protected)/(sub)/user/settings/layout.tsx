import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ユーザー設定 | タスク管理 App',
  description: 'タスク管理 Appのユーザー設定画面',
};

export default function UserSettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
