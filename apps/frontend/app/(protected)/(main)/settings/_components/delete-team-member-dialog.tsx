'use client';

import { useDeleteTeamMember } from '@/api/teams/useDeleteTeamMember';
import { useTeamUsers } from '@/api/teams/useTeamUsers';
import { AppDialog } from '@/components/ui/app-dialog/app-dialog';
import { useAlertStore } from '@/store/alert';
import clsx from 'clsx';

type DeleteTeamMemberDialogProps = {
  actionData: { teamId: string; userId: string; teamRole: 'admin' | 'member'; userName: string };
  isOpen: boolean;
  onClose: () => void;
};

/** チームメンバー削除 ダイアログ */
export const DeleteTeamMemberDialog = ({ actionData, isOpen, onClose }: DeleteTeamMemberDialogProps) => {
  const { trigger } = useDeleteTeamMember(actionData.teamId, actionData.userId);
  const { mutate } = useTeamUsers(actionData.teamId);
  const addAlert = useAlertStore((state) => state.addAlert);

  const onConfirm = async () => {
    await trigger();
    addAlert('チームメンバーの削除に成功', 'success', 5000);
    mutate();
    onClose();
  };

  const onPreClose = () => {
    onClose();
  };

  return (
    <AppDialog
      isOpen={isOpen}
      title="本当にチームメンバーを削除しますか？"
      description={`【ユーザ名】: ${actionData.userName} を削除します。`}
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
          チームユーザ削除
        </button>
      </div>
    </AppDialog>
  );
};
