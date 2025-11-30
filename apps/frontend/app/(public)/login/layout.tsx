import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ログイン | タスク管理 App',
  description: 'タスク管理 Appのログインぺージ',
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
