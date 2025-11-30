'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUpdateUser } from '@/api/users/useUpdateUser';
import { AppCard } from '@/components/ui/app-card/app-card';
import { AppCardButton } from '@/components/ui/app-card/app-card-button';
import { InputField } from '@/components/ui/input/input-field';
import { UserSettingsFormType, userSettingsFormSchema } from '@/lib/schemas/user-settings-form.schema';
import { useAlertStore } from '@/store/alert';
import { useUserStore } from '@/store/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { DeleteAccountDialog } from './_components/delete-account-dialog';

/** ユーザー設定ページ */
export default function UserSettingsPage() {
  const router = useRouter();
  const userData = useUserStore((s) => s.user);
  const formDataChangeUser = useForm<UserSettingsFormType>({
    resolver: zodResolver(userSettingsFormSchema),
  });
  const { trigger, isMutating } = useUpdateUser();
  const setUser = useUserStore((s) => s.setUser);
  const [isOpen, setIsOpen] = useState(false);
  const addAlert = useAlertStore((state) => state.addAlert);

  const onSubmitChangeUser = async (submitData: UserSettingsFormType) => {
    try {
      const result = await trigger(submitData);
      if (userData) {
        setUser({ user: { ...userData.user, name: result.newUserName }, teams: userData.teams });
      }
      router.back();
      addAlert(`ユーザ名称を変更しました - 変更後:${result.newUserName}`, 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return (
    <>
      <AppCard title="ユーザー設定" isBack={true}>
        <form onSubmit={formDataChangeUser.handleSubmit(onSubmitChangeUser)} className="mx-auto max-w-2xl rounded-md">
          <div className="flex flex-col gap-4 p-6 sm:p-8">
            <h3 className="text-xl">ユーザ名称</h3>
            <hr className="border-gray-300" />
            <p className="text-sm">ユーザ名の変更が反映されるまでに時間がかかる場合があります。</p>
            <InputField<UserSettingsFormType>
              name="userName"
              defaultValue={userData?.user.name}
              register={formDataChangeUser.register}
              error={formDataChangeUser.formState.errors.userName?.message}
            />
            <AppCardButton type="submit" disabled={formDataChangeUser.formState.isSubmitting && isMutating} name="ユーザ名称変更">
              {formDataChangeUser.formState.isSubmitting ? '送信中...' : 'ユーザ名称変更'}
            </AppCardButton>
          </div>
        </form>
        {/* アカウント削除 */}
        <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-md p-6 sm:p-8">
          <h3 className="text-xl">アカウント削除</h3>
          <hr className="border-gray-300" />
          <p className="text-sm">一度アカウントを削除すると、元に戻すことはできません。ご注意ください。</p>
          <AppCardButton type="button" disabled={false} color="red" name="アカウント削除" onClick={open}>
            アカウント削除
          </AppCardButton>
        </div>
      </AppCard>
      {/* ダイアログ */}
      <DeleteAccountDialog isOpen={isOpen} onClose={close} />
    </>
  );
}
