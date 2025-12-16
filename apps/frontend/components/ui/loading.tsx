'use client';

import { LoadingIcon } from './icons/loading-icon';

/** ローディング */
export const Loading = () => {
  return (
    <div className="bg-opacity-60 z-modal-backdrop fixed inset-0 flex h-dvh w-full items-center justify-center bg-white">
      <div className="flex items-center">
        <span className="mr-4 text-3xl font-bold">L o a d i n g</span>
        <LoadingIcon className="h-8 w-8 animate-spin text-gray-800" />
      </div>
    </div>
  );
};
