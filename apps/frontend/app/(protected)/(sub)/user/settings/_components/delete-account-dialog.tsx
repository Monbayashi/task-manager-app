'use client';

import { AppDialog } from '@/components/ui/app-dialog/app-dialog';
import clsx from 'clsx';

type DeleteAccountDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const DeleteAccountDialog = ({ isOpen, onClose }: DeleteAccountDialogProps) => {
  const onConfirm = () => {
    onClose();
  };
  return (
    <AppDialog
      isOpen={isOpen}
      title="本当にアカウントを削除しますか？"
      description="この処理は未実装です。以下の処理を検討 FrontEnd -> backend -> 削除用テーブルにデータ書き込み -> Lambda バッチで削除 (キャパシティーユニットを抑える為)"
      type="danger"
      onClose={onClose}
    >
      <div className="mt-4 flex w-full justify-end">
        <button
          type="button"
          className={clsx(
            'inline-flex items-center gap-2 rounded-md bg-red-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10',
            'focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700'
          )}
          onClick={onConfirm}
        >
          このアカウントを削除する
        </button>
      </div>
    </AppDialog>
  );
};
