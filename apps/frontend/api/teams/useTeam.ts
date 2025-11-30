'use client';

import { api } from '@/service/api-client';
import useSWR from 'swr';
import { ResBodyTeamsTeamType } from '@repo/api-models/teams';

export const fetcherTeamsTeam = async (url: string): Promise<ResBodyTeamsTeamType> => {
  const result = await api.get<ResBodyTeamsTeamType>(url);
  return result.data;
};

/**
 * チーム詳細取得
 */
export const useTeam = (teamId: string | null) => {
  return useSWR<ResBodyTeamsTeamType>(teamId ? `/api/teams/${teamId}` : null, fetcherTeamsTeam);
};
