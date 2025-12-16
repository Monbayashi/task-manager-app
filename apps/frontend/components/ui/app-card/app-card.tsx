'use client';

/* eslint-disable @next/next/no-img-element */
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

type AppCardProps = {
  children: ReactNode;
  /** カードタイトル */
  title: string;
  /** カード説明 */
  description?: string;
  /** 戻るボタン表示 */
  isBack?: boolean;
  /** キャンセル */
  cancel?: { text: string; link: string };
};

/**
 * アプリケーションMainカード
 */
export const AppCard = (props: AppCardProps) => {
  const { children, title, description, isBack, cancel } = props;
  const router = useRouter();
  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-center bg-gray-100">
      <div className="my-3 flex items-center justify-center sm:my-4">
        <img src="/android-chrome-192x192.png" alt="アプリのロゴ" className="mr-3 size-6 object-contain sm:size-7 sm:size-8" />
        <h1 className="text-center text-xl font-bold text-gray-800 sm:text-3xl">タスク管理 App</h1>
      </div>
      <div className="max-w-lg rounded-3xl bg-white py-4 shadow-lg sm:py-6">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-8">
          {/* 戻るボタン */}
          {isBack === true && (
            <button
              name="戻る"
              onClick={() => router.back()}
              className="flex cursor-pointer items-center rounded-md p-1 text-sm text-gray-600 ring-orange-400 transition duration-100 outline-none hover:text-gray-800 focus:ring-2"
            >
              <ArrowLeftIcon className="mr-1 size-4 text-gray-800" />
              戻る
            </button>
          )}
          {cancel != null && (
            <button
              name="戻る"
              onClick={() => router.replace(cancel.link)}
              className="flex cursor-pointer items-center rounded-md p-1 text-sm text-gray-600 ring-orange-400 transition duration-100 outline-none hover:text-gray-800 focus:ring-2"
            >
              <ArrowLeftIcon className="mr-1 size-4 text-gray-800" />
              {cancel.text}
            </button>
          )}
          <h2 className="mb-3 text-center text-lg font-bold text-gray-800 sm:mb-4 sm:text-2xl">{title}</h2>
          {description && <div className="text-center text-sm text-gray-800 sm:text-base">{props.description}</div>}
          {children}
        </div>
      </div>
    </main>
  );
};
