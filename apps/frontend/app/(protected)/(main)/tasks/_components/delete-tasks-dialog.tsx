'use client';

import { useDeleteTask } from '@/api/tasks/useDeleteTask';
import { AppDialog } from '@/components/ui/app-dialog/app-dialog';
import { useAlertStore } from '@/store/alert';
import clsx from 'clsx';

type DeleteTasksDialogProps = {
  actionData: { teamId: string; taskId: string; title: string };
  isOpen: boolean;
  onClose: () => void;
  /** 削除後に実行する処理 (タスク一覧画面はデータの再取得, タスク詳細画面は一覧画面に遷移) */
  onAfterDeleted: () => Promise<void> | void;
};

/** タスク削除 ダイアログ */
export const DeleteTasksDialog = ({ actionData, isOpen, onClose, onAfterDeleted }: DeleteTasksDialogProps) => {
  const deleteTask = useDeleteTask(actionData.teamId, actionData.taskId);
  const addAlert = useAlertStore((state) => state.addAlert);

  const onConfirm = async () => {
    await deleteTask.trigger();
    await onAfterDeleted();
    addAlert(`タスクを削除しました`, 'success');
    onClose();
  };

  const onPreClose = () => {
    onClose();
  };

  return (
    <AppDialog
      isOpen={isOpen}
      title="本当にタスクを削除しますか？"
      description={`【タスクタイトル】: ${actionData.title} を削除します。`}
      type="danger"
      onClose={onPreClose}
    >
      <div className="mt-4 flex w-full justify-end">
        <button
          type="button"
          className={clsx(
            'inline-flex cursor-pointer items-center gap-2 rounded-md bg-red-200 px-3 py-2 text-sm/6 font-semibold text-gray-800 shadow-inner shadow-white/10',
            'focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700'
          )}
          onClick={onConfirm}
        >
          タスク削除
        </button>
      </div>
    </AppDialog>
  );
};
