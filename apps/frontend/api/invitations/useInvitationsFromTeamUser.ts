'use client';

import { api } from '@/service/api-client';
import useSWRMutation from 'swr/mutation';
import { ReqBodyInvitationsToTeamUserType, ResBodyInvitationsToTeamUserType } from '@repo/api-models/invitations';

export const createInvitationsFromTeamUser = async (
  url: string,
  { arg }: { arg: ReqBodyInvitationsToTeamUserType }
): Promise<ResBodyInvitationsToTeamUserType> => {
  const response = await api.post(url, arg);
  return response.data;
};

/**
 * チーム招待からチームユーザに登録
 */
export const useInvitationsFromTeamUser = (teamId: string | null, inviteId: string | null) => {
  const url = teamId && inviteId ? `/api/teams/${teamId}/invitation/${inviteId}` : null;
  return useSWRMutation<ResBodyInvitationsToTeamUserType, undefined, string | null, ReqBodyInvitationsToTeamUserType>(
    url,
    createInvitationsFromTeamUser
  );
};
