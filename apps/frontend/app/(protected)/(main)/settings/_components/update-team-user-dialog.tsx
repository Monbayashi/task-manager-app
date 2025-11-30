'use client';

import { useEffect } from 'react';
import { useTeamUsers } from '@/api/teams/useTeamUsers';
import { useUpdateTeamMember } from '@/api/teams/useUpdateTeamMember';
import { AppDialog } from '@/components/ui/app-dialog/app-dialog';
import { Selectbox } from '@/components/ui/selectbox';
import { UpdTeamMemberFormType, updTeamMemberFormSchema } from '@/lib/schemas/upd-team-member-form.schema';
import { useAlertStore } from '@/store/alert';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';

type UpdateTeamUserDialogProps = {
  actionData: { teamId: string; userId: string; teamRole: 'admin' | 'member'; userName: string };
  isOpen: boolean;
  onClose: () => void;
};

/** チームメンバー更新 ダイアログ */
export const UpdateTeamUserDialog = ({ actionData, isOpen, onClose }: UpdateTeamUserDialogProps) => {
  const { trigger } = useUpdateTeamMember(actionData.teamId, actionData.userId);
  const { mutate } = useTeamUsers(actionData.teamId);
  const addAlert = useAlertStore((state) => state.addAlert);

  // 個別更新 - (チームユーザロール)
  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<UpdTeamMemberFormType>({
    resolver: zodResolver(updTeamMemberFormSchema),
  });
  const onSubmitRole = async (submitData: UpdTeamMemberFormType) => {
    await trigger(submitData);
    addAlert('チームメンバーの更新に成功', 'success', 5000);
    mutate();
    onClose();
  };

  const onPreClose = () => {
    onClose();
  };

  useEffect(() => {
    reset({ role: actionData.teamRole === 'admin' ? 'member' : 'admin' });
  }, [actionData, reset]);

  return (
    <AppDialog isOpen={isOpen} title="チームメンバーの更新" type="default" onClose={onPreClose}>
      <form onSubmit={handleSubmit(onSubmitRole)} className="rounded-md">
        <div className="w-28">
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Selectbox
                label="ロール"
                selectedValue={field.value}
                onChange={field.onChange}
                error={errors.role?.message}
                itemList={[
                  { value: 'admin', text: 'admin', type: 'default' },
                  { value: 'member', text: 'member', type: 'default' },
                ]}
              />
            )}
          />
        </div>
        <div className="mt-4 flex w-full justify-end">
          <button
            type="submit"
            className={clsx(
              'inline-flex cursor-pointer items-center gap-2 rounded-md bg-green-200 px-3 py-2 text-sm/6 font-semibold text-gray-800 shadow-inner shadow-white/10',
              'focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700'
            )}
          >
            チームメンバー更新
          </button>
        </div>
      </form>
    </AppDialog>
  );
};
