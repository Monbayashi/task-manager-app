'use client';

import { useDeleteInvitation } from '@/api/invitations/useDeleteInvitation';
import { useInvitations } from '@/api/invitations/useInvitations';
import { AppDialog } from '@/components/ui/app-dialog/app-dialog';
import { useAlertStore } from '@/store/alert';
import clsx from 'clsx';

type DeleteInvitationsDialogProps = {
  actionData: { teamId: string; inviteId: string; email: string };
  isOpen: boolean;
  onClose: () => void;
};

/** チーム招待削除 ダイアログ */
export const DeleteInvitationsDialog = ({ actionData, isOpen, onClose }: DeleteInvitationsDialogProps) => {
  const { trigger, isMutating } = useDeleteInvitation(actionData.teamId, actionData.inviteId);
  const { mutate } = useInvitations(actionData.teamId);
  const addAlert = useAlertStore((state) => state.addAlert);

  const onConfirm = async () => {
    await trigger();
    addAlert('チーム招待の削除に成功', 'success', 5000);
    mutate();
    onClose();
  };

  const onPreClose = () => {
    onClose();
  };

  return (
    <AppDialog
      isOpen={isOpen}
      title="本当にチーム招待を削除しますか？"
      description={`【ユーザ名】: ${actionData.email} を削除します。`}
      type="danger"
      onClose={onPreClose}
    >
      <div className="mt-4 flex w-full justify-end">
        <button
          type="button"
          disabled={isMutating}
          className={clsx(
            'inline-flex cursor-pointer items-center gap-2 rounded-md bg-red-200 px-3 py-2 text-sm/6 font-semibold text-gray-800 shadow-inner shadow-white/10',
            'focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700'
          )}
          onClick={onConfirm}
        >
          チーム招待削除
        </button>
      </div>
    </AppDialog>
  );
};
