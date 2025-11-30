import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '新規チーム | タスク管理 App',
  description: 'タスク管理 Appの新規チーム作成画面',
};

export default function NewTeamLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
