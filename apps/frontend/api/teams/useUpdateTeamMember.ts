import { api } from '@/service/api-client';
import useSWRMutation from 'swr/mutation';
import { ReqBodyTeamMemberUpdateType, ResBodyTeamMemberUpdateType } from '@repo/api-models/teams';

export const updateTeamMember = async (url: string, { arg }: { arg: ReqBodyTeamMemberUpdateType }): Promise<ResBodyTeamMemberUpdateType> => {
  const response = await api.put(url, arg);
  return response.data;
};

/**
 * チームメンバー更新API
 */
export const useUpdateTeamMember = (teamId: string | null, userId: string | null) => {
  const url = teamId && userId ? `/api/teams/${teamId}/team-member/${userId}` : null;
  return useSWRMutation<ResBodyTeamMemberUpdateType, undefined, string | null, ReqBodyTeamMemberUpdateType>(url, updateTeamMember);
};
