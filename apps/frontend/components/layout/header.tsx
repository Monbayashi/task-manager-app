'use client';

import { useSidebarStore } from '@/store/sidebar';
import { Bars3Icon } from '@heroicons/react/24/outline';

/**
 * ヘッダー
 */
export const Header = () => {
  const onMenuToggle = useSidebarStore((state) => state.toggle);
  return (
    <header className="z-header fixed flex h-16 w-full items-center justify-between bg-white p-4 shadow-xs lg:hidden">
      <button id="menu-btn" onClick={onMenuToggle} className="rounded p-2 hover:bg-gray-200">
        <Bars3Icon className="size-6" />
      </button>
      <h1 className="text-lg font-bold">タスク管理 App </h1>
    </header>
  );
};
