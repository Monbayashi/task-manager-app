import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'サインアップ | タスク管理 App',
  description: 'タスク管理 Appのサインアップぺージ',
};

export default function SignupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
