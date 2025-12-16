'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';

type AppButtonPropsCommon = {
  children: ReactNode;
  disabled: boolean;
  name: string;
  color?: 'white' | 'red';
};
type AppButtonPropsSubmit = AppButtonPropsCommon & {
  type: 'submit';
  onClick?: never;
};
type AppButtonPropsButton = AppButtonPropsCommon & {
  type: 'button';
  onClick: () => Promise<void> | void;
};
type AppButtonProps = AppButtonPropsSubmit | AppButtonPropsButton;

/** アプリケーション共通ボタン */
export const AppButton = (props: AppButtonProps) => {
  const { type, children, disabled, name, onClick, color = 'white' } = props;
  return (
    <button
      type={type}
      disabled={disabled}
      name={name}
      onClick={onClick}
      className={clsx(
        'flex cursor-pointer items-center justify-center rounded-lg border text-center font-semibold ring-orange-400 transition duration-100 outline-none focus:border-orange-400 focus:ring-2',
        'sm: gap-2 px-3 py-1.5 text-sm sm:gap-1 sm:py-2.5 sm:text-base',
        color === 'white' && 'border-gray-400 bg-white text-gray-800 hover:bg-gray-100 active:bg-gray-200 disabled:bg-gray-200',
        color === 'red' && 'border-red-400 bg-red-100 text-red-900 hover:bg-red-200 active:bg-red-200 disabled:bg-gray-200'
      )}
    >
      {children}
    </button>
  );
};
