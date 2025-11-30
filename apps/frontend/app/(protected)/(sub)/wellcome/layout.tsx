import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ようこそ | タスク管理 App',
  description: 'タスク管理 Appへようこそ',
};

export default function WellcomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
