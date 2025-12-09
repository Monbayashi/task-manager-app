'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useInvitationsFromTeamUser } from '@/api/invitations/useInvitationsFromTeamUser';
import { AppCard } from '@/components/ui/app-card/app-card';
import { AppCardButton } from '@/components/ui/app-card/app-card-button';
import { useUserStore } from '@/store/user';
import { UserPlusIcon } from '@heroicons/react/24/outline';

/** チーム招待ページ */
export default function InvitationPage() {
  const router = useRouter();
  const params = useSearchParams();
  const teamId = params.get('teamId');
  const inviteId = params.get('inviteId');
  const token = params.get('token');
  const teamName = params.get('teamName');
  const { trigger, isMutating } = useInvitationsFromTeamUser(teamId, inviteId);
  const mutateUser = useUserStore((s) => s.mutateUser);

  const onInvite = async () => {
    try {
      if (!teamId || !token) return;
      const result = await trigger({ token: token });
      await mutateUser();
      router.push(`/home/?teamId=${result.teamId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const isDisabled = !!teamId && !!inviteId && !!token && isMutating;

  return (
    <AppCard
      title="チームへの招待"
      description="以下のチームから招待が届いています。参加する場合は参加ボタンをクリックしてください。"
      cancel={{ text: 'キャンセル', link: '/choose-team/' }}
    >
      <div className="flex items-center gap-4 p-6 sm:p-8">
        <p className="text-lg text-gray-500">チーム名: </p>
        <p className="text-xl text-gray-800">{teamName}</p>
      </div>
      <div className="flex flex-col gap-4 p-6 sm:p-8">
        <AppCardButton type="button" disabled={isDisabled} name="チームへ参加" onClick={onInvite}>
          <UserPlusIcon className="size-5" />
          {isMutating ? '送信中...' : 'チームへ参加'}
        </AppCardButton>
      </div>
    </AppCard>
  );
}
