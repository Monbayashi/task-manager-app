'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AppCard } from '@/components/ui/app-card/app-card';
import { useUserStore } from '@/store/user';
import { ClipboardDocumentCheckIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

/** チーム選択ページ */
export default function ChooseTeamPage() {
  const router = useRouter();
  const pathParams = useSearchParams();
  const userData = useUserStore((s) => s.user);

  const teams = userData?.teams || [];
  const redirect = pathParams.get('redirect') || 'home';

  return (
    <AppCard title="チーム選択" description="表示するチーム選択してください">
      <div className="mx-auto w-80 max-w-lg divide-y divide-gray-400 rounded-xl px-4 sm:w-md">
        {teams.map((team) => (
          <button
            key={team.teamId}
            onClick={() => router.push(`${redirect}?teamId=${team.teamId}`)}
            type="button"
            className="flex w-full cursor-pointer items-center justify-center p-6 font-bold text-gray-800 hover:bg-gray-100 sm:text-lg"
          >
            <ClipboardDocumentCheckIcon className="mr-2 size-8 text-gray-800" />
            {team.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => router.push('/new-team')}
          className="flex w-full cursor-pointer items-center justify-center p-6 font-bold text-gray-800 hover:bg-green-50 sm:text-lg"
        >
          <PlusCircleIcon className="mr-2 size-8 text-green-800" />
          新規チーム作成
        </button>
      </div>
    </AppCard>
  );
}
