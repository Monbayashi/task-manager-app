import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'チーム招待 | タスク管理 App',
  description: 'タスク管理 Appのチーム招待画面',
};

export default function NewTeamLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
