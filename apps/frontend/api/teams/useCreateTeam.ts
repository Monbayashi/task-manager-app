'use client';

import { api } from '@/service/api-client';
import useSWRMutation from 'swr/mutation';
import { ReqBodyTeamsRegisterType, ResBodyTeamsRegisterType } from '@repo/api-models/teams';

export const createTeam = async (url: '/api/teams/register', { arg }: { arg: ReqBodyTeamsRegisterType }): Promise<ResBodyTeamsRegisterType> => {
  const response = await api.post(url, arg);
  return response.data;
};

/**
 * チーム登録API
 */
export const useCreateTeam = () => {
  return useSWRMutation<ResBodyTeamsRegisterType, undefined, '/api/teams/register', ReqBodyTeamsRegisterType>('/api/teams/register', createTeam);
};
