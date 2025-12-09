'use client';

import { useRouter } from 'next/navigation';
import { useCreateTeam } from '@/api/teams/useCreateTeam';
import { AppCard } from '@/components/ui/app-card/app-card';
import { AppCardButton } from '@/components/ui/app-card/app-card-button';
import { InputField } from '@/components/ui/input/input-field';
import { NewTeamFormType, newTeamFormSchema } from '@/lib/schemas/new-team-form.schema';
import { useUserStore } from '@/store/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

/** 新規チーム作成ページ */
export default function NewTeamPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewTeamFormType>({
    resolver: zodResolver(newTeamFormSchema),
  });
  const { trigger, isMutating } = useCreateTeam();
  const mutateUser = useUserStore((s) => s.mutateUser);

  const onSubmit = async (submitData: NewTeamFormType) => {
    try {
      const result = await trigger(submitData);
      // ユーザデータ更新
      await mutateUser();
      router.push(`/home/?teamId=${result.teamId}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppCard title="新規チーム登録" description="以下を入力してチームを作成してください。" isBack={true}>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-lg rounded-md border border-gray-400">
        <div className="flex flex-col gap-4 p-6 sm:p-8">
          <InputField<NewTeamFormType> label="チーム名称" name="teamName" register={register} error={errors.teamName?.message} />
          <AppCardButton type="submit" disabled={isSubmitting && isMutating} name="チーム登録">
            {isSubmitting ? '送信中...' : 'チーム登録'}
          </AppCardButton>
        </div>
      </form>
    </AppCard>
  );
}
