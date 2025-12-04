'use client';

import { api } from '@/service/api-client';
import useSWR from 'swr';
import { ResBodyTeamsUsersType } from '@repo/api-models/teams';

export const fetcherTeamsUsers = async (url: string): Promise<ResBodyTeamsUsersType> => {
  const result = await api.get<ResBodyTeamsUsersType>(url);
  return result.data;
};

/**
 * チームユーザ一覧
 */
export const useTeamUsers = (teamId: string | null) => {
  return useSWR<ResBodyTeamsUsersType>(teamId ? `/api/teams/${teamId}/team-member` : null, fetcherTeamsUsers);
};
