'use client';

import { useRouter } from 'next/navigation';
import { useCreateUser } from '@/api/users/useCreateUser';
import { AppCard } from '@/components/ui/app-card/app-card';
import { AppCardButton } from '@/components/ui/app-card/app-card-button';
import { InputField } from '@/components/ui/input/input-field';
import { WellcomeFormType, wellcomeFormSchema } from '@/lib/schemas/wellcom-form.schema';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

/** ようこそ画面 */
export default function WellcomePage() {
  const email = useAuthStore((s) => s.email);
  const router = useRouter();
  const mutateUser = useUserStore((s) => s.mutateUser);
  const { trigger, isMutating } = useCreateUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WellcomeFormType>({
    resolver: zodResolver(wellcomeFormSchema),
  });

  const onSubmit = async (submitData: WellcomeFormType) => {
    try {
      const { teamId } = await trigger(submitData);
      await mutateUser();
      router.push(`/home?teamId=${teamId}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppCard title="タスク管理App へようこそ" description="以下を入力してアカウントを作成してください。">
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-lg rounded-md border border-gray-400">
        <div className="flex flex-col gap-4 p-6 sm:p-8">
          <InputField<WellcomeFormType>
            label="メールアドレス"
            type="email"
            name="email"
            register={register}
            error={errors.email?.message}
            disabled={true}
            defaultValue={email ?? undefined}
          />
          <InputField<WellcomeFormType> label="ユーザ名称" name="userName" register={register} error={errors.userName?.message} />
          <InputField<WellcomeFormType>
            label="チーム名称"
            description="初期に作成されるチーム名称"
            name="teamName"
            register={register}
            error={errors.teamName?.message}
          />
          <AppCardButton type="submit" disabled={isSubmitting && isMutating} name="アカウントを作成">
            {isSubmitting ? '送信中...' : 'アカウントを作成'}
          </AppCardButton>
        </div>
      </form>
    </AppCard>
  );
}
