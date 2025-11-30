import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'チーム選択 | タスク管理 App',
  description: 'タスク管理 Appのチーム選択画面',
};

export default function ChooseTeamLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
