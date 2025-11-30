import { api } from '@/service/api-client';
import useSWRMutation from 'swr/mutation';
import { ReqBodyTeamsUpdateType, ResBodyTeamsUpdateType } from '@repo/api-models/teams';

export const updateTeam = async (url: string, { arg }: { arg: ReqBodyTeamsUpdateType }): Promise<ResBodyTeamsUpdateType> => {
  const response = await api.put(url, arg);
  return response.data;
};

/**
 * チーム更新API
 */
export const useUpdateTeam = (teamId: string | null) => {
  return useSWRMutation<ResBodyTeamsUpdateType, undefined, string | null, ReqBodyTeamsUpdateType>(teamId ? `/api/teams/${teamId}` : null, updateTeam);
};
