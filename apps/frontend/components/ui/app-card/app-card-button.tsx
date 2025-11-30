'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';

type AppCardButtonPropsCommon = {
  children: ReactNode;
  disabled: boolean;
  name: string;
  color?: 'white' | 'red';
};
type AppCardButtonPropsSubmit = AppCardButtonPropsCommon & {
  type: 'submit';
  onClick?: never;
};
type AppCardButtonPropsButton = AppCardButtonPropsCommon & {
  type: 'button';
  onClick: () => Promise<void> | void;
};
type AppCardButtonProps = AppCardButtonPropsSubmit | AppCardButtonPropsButton;

/** アプリケーションMainカード用 ボタン */
export const AppCardButton = (props: AppCardButtonProps) => {
  const { type, children, disabled, name, onClick, color = 'white' } = props;
  return (
    <button
      type={type}
      disabled={disabled}
      name={name}
      onClick={onClick}
      className={clsx(
        'flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-8 py-3 text-center text-sm font-semibold ring-orange-400 transition duration-100 outline-none focus:border-orange-400 focus:ring-2 sm:text-base',
        color === 'white' && 'border-gray-400 bg-white text-gray-800 hover:bg-gray-100 active:bg-gray-200 disabled:bg-gray-200',
        color === 'red' && 'border-red-400 bg-red-100 text-red-900 hover:bg-red-200 active:bg-red-200 disabled:bg-gray-200'
      )}
    >
      {children}
    </button>
  );
};
