import { api } from '@/service/api-client';
import useSWRMutation from 'swr/mutation';
import { ReqBodyTasksRegisterType, ResBodyTasksRegisterType } from '@repo/api-models/tasks';

export const createTask = async (url: string, { arg }: { arg: ReqBodyTasksRegisterType }): Promise<ResBodyTasksRegisterType> => {
  const response = await api.post(url, arg);
  return response.data;
};

/**
 * タグ登録API
 */
export const useCreateTask = (teamId: string | null) => {
  return useSWRMutation<ResBodyTasksRegisterType, undefined, string | null, ReqBodyTasksRegisterType>(
    teamId ? `/api/teams/${teamId}/tasks` : null,
    createTask
  );
};
