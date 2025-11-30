import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ホーム | タスク管理 App',
  description: 'タスク管理 Appのホームぺージ',
};

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
