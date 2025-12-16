'use client';

import { ReactNode } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

type AppDialogProps = {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  type?: 'default' | 'danger' | 'info' | 'warning';
};

/**
 * アプリケーションで使うデフォルトのDialog
 */
export const AppDialog = ({ isOpen, title, description, children, type = 'default', onClose }: AppDialogProps) => {
  const titleColor = {
    default: 'text-gray-800',
    danger: 'text-red-800',
    info: 'text-blue-800',
    warning: 'text-amber-800',
  }[type];
  return (
    <Dialog open={isOpen} as="div" className="relative focus:outline-none" onClose={onClose}>
      <div className="z-modal-backdrop fixed inset-0 w-screen overflow-y-auto bg-black/25" />
      <div className="z-modal fixed inset-0 flex min-h-dvh items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
        >
          <DialogTitle as="h3" className={clsx('mb-6 flex items-center justify-between border-b border-gray-400 pb-2 text-lg font-bold', titleColor)}>
            {title}
            <button
              aria-label="モーダルを閉じる"
              type="button"
              className={clsx(
                'rounded-md border border-slate-300 p-2.5 text-center text-sm text-gray-600 ring-orange-400 transition-all duration-100 outline-none',
                'hover:border-gray-200 hover:bg-gray-200 focus:border-gray-200 focus:bg-gray-200 focus:ring-2',
                'active:border-gray-800 active:bg-gray-800 active:text-white'
              )}
              onClick={onClose}
            >
              <XMarkIcon className="size-3" />
            </button>
          </DialogTitle>
          <p className="mt-2 text-sm text-gray-800">{description}</p>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
};
