'use client';

import { useDeleteTag } from '@/api/tags/useDeleteTag';
import { useTag } from '@/api/tags/useTag';
import { AppDialog } from '@/components/ui/app-dialog/app-dialog';
import { useAlertStore } from '@/store/alert';
import clsx from 'clsx';
import { ActionData } from '../page';

type DeleteTagDialogProps = {
  actionData: ActionData;
  isOpen: boolean;
  onClose: () => void;
};

/** タグ削除 ダイアログ */
export const DeleteTagDialog = ({ actionData, isOpen, onClose }: DeleteTagDialogProps) => {
  const deleteTag = useDeleteTag(actionData.teamId, actionData.tagId);
  const { mutate } = useTag(actionData.teamId);
  const addAlert = useAlertStore((state) => state.addAlert);

  const onConfirm = async () => {
    await deleteTag.trigger();
    mutate();
    addAlert(`タグを削除しました`, 'success');
    onClose();
  };

  const onPreClose = () => {
    onClose();
  };

  return (
    <AppDialog
      isOpen={isOpen}
      title="本当にタグを削除しますか？"
      description={`【タグ名】: ${actionData.tagName} を削除します。`}
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
          タグ削除
        </button>
      </div>
    </AppDialog>
  );
};
