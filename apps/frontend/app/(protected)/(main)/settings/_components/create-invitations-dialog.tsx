'use client';

import { useCreateInvitation } from '@/api/invitations/useCreateInvitation';
import { useInvitations } from '@/api/invitations/useInvitations';
import { AppDialog } from '@/components/ui/app-dialog/app-dialog';
import { InputField } from '@/components/ui/input/input-field';
import { SelectBoxProps, Selectbox } from '@/components/ui/selectbox';
import { NewInvitationType, newInvitationSchema } from '@/lib/schemas/new-invitation.schema';
import { useAlertStore } from '@/store/alert';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';

type ItemListType = SelectBoxProps['itemList'];

type CreateInvitationsDialogProps = {
  actionData: { teamId: string; teamName: string };
  isOpen: boolean;
  /** 操作中のユーザロール */
  isAdmin: boolean;
  onClose: () => void;
};

/** 新規チーム招待登録 ダイアログ */
export const CreateInvitationsDialog = ({ actionData, isOpen, isAdmin, onClose }: CreateInvitationsDialogProps) => {
  const { trigger } = useCreateInvitation(actionData.teamId);
  const { mutate } = useInvitations(actionData.teamId);
  const addAlert = useAlertStore((state) => state.addAlert);
  const itemList: ItemListType = isAdmin
    ? [
        { value: 'admin', text: 'admin', type: 'default' },
        { value: 'member', text: 'member', type: 'default' },
      ]
    : [{ value: 'member', text: 'member', type: 'default' }];

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<NewInvitationType>({
    resolver: zodResolver(newInvitationSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  const onSubmit = async (submitData: NewInvitationType) => {
    await trigger({ ...submitData, teamName: actionData.teamName });
    addAlert('チーム招待の作成に成功', 'success', 5000);
    mutate();
    onClose();
  };

  const onPreClose = () => {
    onClose();
  };

  return (
    <AppDialog isOpen={isOpen} title="チーム招待の登録" type="default" onClose={onPreClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-md">
        <InputField<NewInvitationType>
          label="メールアドレス"
          type="email"
          placeholder="you@example.com"
          name="email"
          register={register}
          error={errors.email?.message}
        />
        <div className="w-28">
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Selectbox label="ロール" selectedValue={field.value} onChange={field.onChange} error={errors.role?.message} itemList={itemList} />
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
            チーム招待登録
          </button>
        </div>
      </form>
    </AppDialog>
  );
};
