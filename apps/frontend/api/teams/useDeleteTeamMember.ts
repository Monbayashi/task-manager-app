import { api } from '@/service/api-client';
import useSWRMutation from 'swr/mutation';
import { ResBodyTeamMemberDeleteType } from '@repo/api-models/teams';

export const deleteTeamMember = async (url: string): Promise<ResBodyTeamMemberDeleteType> => {
  const response = await api.delete(url);
  return response.data;
};

/**
 * チームメンバー削除API
 */
export const useDeleteTeamMember = (teamId: string | null, userId: string | null) => {
  const url = teamId && userId ? `/api/teams/${teamId}/team-member/${userId}` : null;
  return useSWRMutation<ResBodyTeamMemberDeleteType>(url, deleteTeamMember);
};
