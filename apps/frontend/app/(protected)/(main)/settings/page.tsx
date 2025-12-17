'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useInvitations } from '@/api/invitations/useInvitations';
import { useTag } from '@/api/tags/useTag';
import { useTeamUsers } from '@/api/teams/useTeamUsers';
import { useUpdateTeam } from '@/api/teams/useUpdateTeam';
import { AppButton } from '@/components/ui/button';
import { InputField } from '@/components/ui/input/input-field';
import { UpdTeamFormType, updTeamFormSchema } from '@/lib/schemas/upd-team-form.schema';
import { useAlertStore } from '@/store/alert';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/user';
import { PlusIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { formatInTimeZone } from 'date-fns-tz';
import { useForm } from 'react-hook-form';
import { CreateInvitationsDialog } from './_components/create-invitations-dialog';
import { CreateTagDialog } from './_components/create-tags-dialog';
import { DeleteInvitationsDialog } from './_components/delete-invitations-dialog';
import { DeleteTagDialog } from './_components/delete-tags-dialog';
import { DeleteTeamMemberDialog } from './_components/delete-team-member-dialog';
import { UpdateTagDialog } from './_components/update-tags-dialog';
import { UpdateTeamUserDialog } from './_components/update-team-user-dialog';

export type ActionData = {
  tagId: string;
  teamId: string;
  tagName: string;
  tagColor: { color: string; backgroundColor: string };
};

const DEFAULT_ACTION_DATA: ActionData = {
  tagId: '',
  teamId: '',
  tagName: '',
  tagColor: { color: '', backgroundColor: '' },
} as const;

/** 設定画面 */
export default function SettingsPage() {
  const pathParams = useSearchParams();
  const teamId = pathParams.get('teamId');
  const userData = useUserStore((s) => s.user);
  const userIdMe = useAuthStore((s) => s.userId);
  const setUser = useUserStore((s) => s.setUser);
  const addAlert = useAlertStore((state) => state.addAlert);
  /** 操作中のユーザロール */
  const isAdmin = userData?.teams.find((val) => val.teamId === teamId)?.role === 'admin' ? true : false;

  // 個別更新 - (チーム)
  const updateTeam = useUpdateTeam(teamId);
  const {
    register: teamNameRegister,
    handleSubmit: teamNameHandleSubmit,
    formState: { errors: teamNameErrors },
    reset: teamNameReset,
  } = useForm<UpdTeamFormType>({
    resolver: zodResolver(updTeamFormSchema),
  });

  const onSubmitTeamName = async (submitData: UpdTeamFormType) => {
    if (userData == null) return;
    const result = await updateTeam.trigger(submitData);
    // ストアのチーム名称更新
    const updateTeams =
      userData.teams.map((team) => {
        if (team.teamId === teamId) {
          return { ...team, name: result.newTeamName };
        }
        return team;
      }) ?? [];
    setUser({ user: userData.user, teams: updateTeams });
    addAlert(`ユーザ名称を変更しました - 変更後:${result.newTeamName}`, 'success');
  };

  // チームのreset
  useEffect(() => {
    const selectedTeam = userData?.teams.find((team) => team.teamId === teamId);
    if (selectedTeam) {
      teamNameReset({ teamName: selectedTeam.name });
    }
  }, [teamId, teamNameReset, userData?.teams]);

  // チームユーザ
  const teamUserData = useTeamUsers(teamId);
  const [isUpdateTeamUserOpen, setIsUpdateTeamUserOpen] = useState(false);
  const [isDeleteTeamUserOpen, setIsDeleteTeamUserOpen] = useState(false);
  const [actionTeamUserData, setActionTeamUserData] = useState<{ teamId: string; userId: string; teamRole: 'admin' | 'member'; userName: string }>({
    teamId: '',
    userId: '',
    teamRole: 'member',
    userName: '',
  });
  const onUpdateTeamUserOpen = (props: { teamId: string; userId: string; userTeamRole: 'admin' | 'member'; joinedAt: string; userName: string }) => {
    setActionTeamUserData({ teamId: props.teamId, userId: props.userId, teamRole: props.userTeamRole, userName: props.userName });
    setIsUpdateTeamUserOpen(true);
  };
  const onUpdateTeamUserClose = () => {
    setActionTeamUserData({ teamId: '', userId: '', teamRole: 'member', userName: '' });
    setIsUpdateTeamUserOpen(false);
  };
  const onDeleteTeamUserOpen = (props: { teamId: string; userId: string; userTeamRole: 'admin' | 'member'; joinedAt: string; userName: string }) => {
    setActionTeamUserData({ teamId: props.teamId, userId: props.userId, teamRole: props.userTeamRole, userName: props.userName });
    setIsDeleteTeamUserOpen(true);
  };
  const onDeleteTeamUserClose = () => {
    setActionTeamUserData({ teamId: '', userId: '', teamRole: 'member', userName: '' });
    setIsDeleteTeamUserOpen(false);
  };

  // チーム招待
  const invitations = useInvitations(teamId);
  const [isInviteUserOpen, setIsInviteUserOpen] = useState(false);
  const [isDeleteInviteUserOpen, setIsDeleteInviteUserOpen] = useState(false);
  const [actionInviteUserData, setActionInviteUserData] = useState<{ teamId: string; inviteId: string; email: string }>({
    teamId: '',
    inviteId: '',
    email: '',
  });
  const onInviteUserOpen = () => {
    setIsInviteUserOpen(true);
  };
  const onInviteUserClose = () => {
    setIsInviteUserOpen(false);
  };
  const onDeleteInviteUserOpen = (props: { teamId: string; inviteId: string; email: string }) => {
    setActionInviteUserData({ teamId: props.teamId, inviteId: props.inviteId, email: props.email });
    setIsDeleteInviteUserOpen(true);
  };
  const onDeleteInviteUserClose = () => {
    setActionInviteUserData({ teamId: '', inviteId: '', email: '' });
    setIsDeleteInviteUserOpen(false);
  };

  // タグ系
  const tagsDatas = useTag(teamId);
  const tags = tagsDatas.data?.tags || [];
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [actionData, setActionData] = useState<ActionData>(DEFAULT_ACTION_DATA);
  const getTag = (tagId: string) => {
    return tags.find((tag) => tag.tagId === tagId);
  };
  const onCreateOpen = () => {
    setIsCreateOpen(true);
  };

  const onCreateClose = () => {
    setIsCreateOpen(false);
  };

  const onUpdateOpen = (tagId: string) => {
    const targetTag = getTag(tagId);
    if (targetTag == null) return;
    setActionData(targetTag);
    setIsUpdateOpen(true);
  };

  const onUpdateClose = () => {
    setActionData(DEFAULT_ACTION_DATA);
    setIsUpdateOpen(false);
  };

  const onDeleteOpen = (tagId: string) => {
    const targetTag = getTag(tagId);
    if (targetTag == null) return;
    setActionData(targetTag);
    setIsDeleteOpen(true);
  };

  const onDeleteClose = () => {
    setActionData(DEFAULT_ACTION_DATA);
    setIsDeleteOpen(false);
  };

  return (
    <>
      <div className="container mx-auto">
        <div className="w-full p-4">
          {/* チーム更新 */}
          <h2 className="mb-1.5 text-base font-bold text-gray-600 sm:text-lg">チーム更新</h2>
          <hr className="text-gray-400" />
          <form onSubmit={teamNameHandleSubmit(onSubmitTeamName)} className="mt-3 flex w-full items-end gap-1 rounded-md">
            <div className="w-72">
              <InputField<UpdTeamFormType>
                type="text"
                label="チーム名称"
                name="teamName"
                register={teamNameRegister}
                error={teamNameErrors.teamName?.message}
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={updateTeam.isMutating}
                className={clsx(
                  'rounded-md border border-gray-600 bg-green-100 px-2 text-base ring-orange-400 transition duration-100 outline-none',
                  'disabled:bg-gray-100g hover:bg-green-200 focus:border-orange-400 focus:ring-2 active:bg-gray-200',
                  'py-2.5 text-sm sm:py-2 sm:text-base'
                )}
              >
                更新
              </button>
            </div>
          </form>
        </div>
        {/* チームメンバー */}
        <div className="p-4">
          <h2 className="mb-1.5 text-base font-bold text-gray-600 sm:text-lg">チームメンバー</h2>
          <hr className="text-gray-400" />
          <div className="max-w-4xl overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-gray-200">
              <thead className="ltr:text-left rtl:text-right">
                <tr className="*:font-medium *:text-gray-900">
                  <th className="px-3 py-2 text-center whitespace-nowrap">ユーザ名</th>
                  <th className="px-3 py-2 text-center whitespace-nowrap">ロール</th>
                  <th className="px-3 py-2 text-center whitespace-nowrap">参加日時</th>
                  {isAdmin && <th className="px-3 py-2 text-center whitespace-nowrap">アクション</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teamUserData.data?.users.map((user) => (
                  <tr key={user.userId} className="*:text-gray-900 *:first:font-medium">
                    <td className="px-3 py-2 text-center whitespace-nowrap">{user.userName}</td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">{user.userTeamRole}</td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      {formatInTimeZone(new Date(user.joinedAt), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss')}
                    </td>
                    {isAdmin && (
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <UpdateDeleteButton
                          disabled={userIdMe === user.userId}
                          onUpdate={() => onUpdateTeamUserOpen(user)}
                          onDelete={() => onDeleteTeamUserOpen(user)}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* チーム招待 */}
        <div className="p-4">
          <h2 className="mb-1.5 text-base font-bold text-gray-600 sm:text-lg">チーム招待</h2>
          <hr className="text-gray-400" />
          <div className="w-full overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-gray-200">
              <thead className="ltr:text-left rtl:text-right">
                <tr className="*:font-medium *:text-gray-900">
                  <th className="px-3 py-2 text-center whitespace-nowrap">メールアドレス</th>
                  <th className="px-3 py-2 text-center whitespace-nowrap">ロール</th>
                  <th className="px-3 py-2 text-center whitespace-nowrap">有効期限</th>
                  <th className="px-3 py-2 text-center whitespace-nowrap">アクション</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invitations.data?.invitations.map((invitation) => (
                  <tr key={invitation.inviteId} className="*:text-gray-900 *:first:font-medium">
                    <td className="px-3 py-2 text-center whitespace-nowrap">{invitation.email}</td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">{invitation.role}</td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      {formatInTimeZone(new Date(invitation.expiresAt), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss')}
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <div className="inline-flex divide-x rounded-lg border border-gray-400 bg-gray-50 text-sm text-gray-900 select-none">
                        <button
                          type="button"
                          disabled={false}
                          onClick={() => onDeleteInviteUserOpen(invitation)}
                          className={clsx(
                            'rounded-lg bg-white px-3 py-1.5 text-base ring-orange-400 transition duration-100 outline-none',
                            'disabled:bg-gray-100g hover:bg-gray-100 focus:ring-2 active:bg-gray-200'
                          )}
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 mb-2 flex justify-end px-2">
            <AppButton type="button" disabled={false} name="チーム招待" onClick={onInviteUserOpen}>
              <PlusIcon className="size-4 text-green-800 md:size-5" />
              チーム招待
            </AppButton>
          </div>
        </div>
        {/* タグ関連 */}
        <div className="p-4">
          <h2 className="mb-1.5 text-base font-bold text-gray-600 sm:text-lg">タグ一覧</h2>
          <hr className="text-gray-400" />
          <div className="overflow-x-auto">
            <table className="w-full divide-y-2 divide-gray-200">
              <thead className="ltr:text-left rtl:text-right">
                <tr className="*:font-medium *:text-gray-900">
                  <th className="px-3 py-2 text-center whitespace-nowrap">タグ</th>
                  <th className="px-3 py-2 text-center whitespace-nowrap">アクション</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tags.map((tag) => (
                  <tr key={tag.tagId} className="*:text-gray-900 *:first:font-medium">
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <span style={tag.tagColor} className="rounded-full border border-gray-300 px-4 py-1 text-sm">
                        {tag.tagName}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <UpdateDeleteButton disabled={false} onUpdate={() => onUpdateOpen(tag.tagId)} onDelete={() => onDeleteOpen(tag.tagId)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 mb-2 flex justify-end px-2">
            <AppButton type="button" disabled={false} name="タグ登録" onClick={onCreateOpen}>
              <PlusIcon className="size-4 text-green-800 md:size-5" />
              タグ登録
            </AppButton>
          </div>
        </div>
      </div>
      {/* タグ系 ダイアログ */}
      {teamId && <CreateTagDialog teamId={teamId} isOpen={isCreateOpen} onClose={onCreateClose} />}
      {teamId && <UpdateTagDialog actionData={actionData} isOpen={isUpdateOpen} onClose={onUpdateClose} />}
      {teamId && <DeleteTagDialog actionData={actionData} isOpen={isDeleteOpen} onClose={onDeleteClose} />}
      {/* チームユーザ系 ダイアログ */}
      {teamId && <UpdateTeamUserDialog actionData={actionTeamUserData} isOpen={isUpdateTeamUserOpen} onClose={onUpdateTeamUserClose} />}
      {teamId && <DeleteTeamMemberDialog actionData={actionTeamUserData} isOpen={isDeleteTeamUserOpen} onClose={onDeleteTeamUserClose} />}
      {/* チーム招待系 ダイアログ */}
      {teamId && (
        <CreateInvitationsDialog
          actionData={{ teamId, teamName: userData?.teams.find((team) => team.teamId === teamId)?.name || '不明' }}
          isAdmin={isAdmin}
          isOpen={isInviteUserOpen}
          onClose={onInviteUserClose}
        />
      )}
      {teamId && <DeleteInvitationsDialog actionData={actionInviteUserData} isOpen={isDeleteInviteUserOpen} onClose={onDeleteInviteUserClose} />}
    </>
  );
}

export const UpdateDeleteButton = ({ disabled, onUpdate, onDelete }: { disabled: boolean; onUpdate: () => void; onDelete: () => void }) => {
  return (
    <div className="inline-flex divide-x rounded-lg border border-gray-400 bg-gray-50 text-sm text-gray-900 select-none">
      <button
        type="button"
        disabled={disabled}
        onClick={onUpdate}
        className={clsx(
          'rounded-l-lg bg-white px-3 py-1.5 text-base ring-orange-400 transition duration-100 outline-none',
          'hover:bg-gray-100 focus:ring-2 active:bg-gray-200 disabled:bg-gray-200'
        )}
      >
        更新
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onDelete}
        className={clsx(
          'rounded-r-lg bg-white px-3 py-1.5 text-base ring-orange-400 transition duration-100 outline-none',
          'hover:bg-gray-100 focus:ring-2 active:bg-gray-200 disabled:bg-gray-200'
        )}
      >
        削除
      </button>
    </div>
  );
};
