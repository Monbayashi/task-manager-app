import { api } from '@/service/api-client';
import useSWRMutation from 'swr/mutation';
import { ReqBodyInvitationsRegisterType, ResBodyInvitationsRegisterType } from '@repo/api-models/invitations';

export const createInvitation = async (url: string, { arg }: { arg: ReqBodyInvitationsRegisterType }): Promise<ResBodyInvitationsRegisterType> => {
  const response = await api.post(url, arg);
  return response.data;
};

/**
 * チーム招待登録API
 */
export const useCreateInvitation = (teamId: string | null) => {
  return useSWRMutation<ResBodyInvitationsRegisterType, undefined, string | null, ReqBodyInvitationsRegisterType>(
    teamId ? `/api/teams/${teamId}/invitation` : null,
    createInvitation
  );
};
